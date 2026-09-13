const {req, src} = require('./bootstrap.cjs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {Test} = req('@nestjs/testing');
const {ValidationPipe, BadRequestException} = req('@nestjs/common');
const {JwtService} = req('@nestjs/jwt');
const {Reflector} = req('@nestjs/core');
const {getRepositoryToken} = req('@nestjs/typeorm');
const {ThrottlerModule} = req('@nestjs/throttler');
const {lastValueFrom, of} = req('rxjs');
const request = req('supertest');
const bcrypt = req('bcrypt');
const {UsersService} = src('users/users.service');
const {UsersController} = src('users/users.controller');
const {AppsService} = src('apps/apps.service');
const {AppsController} = src('apps/apps.controller');
const {CardsService} = src('cards/cards.service');
const {CardsController} = src('cards/cards.controller');
const {DevicesService} = src('devices/devices.service');
const {DevicesController} = src('devices/devices.controller');
const {CloudFunctionsService} = src('cloud-functions/cloud-functions.service');
const {CloudFunctionsController} = src('cloud-functions/cloud-functions.controller');
const {RemoteVariablesService} = src('remote-variables/remote-variables.service');
const {RemoteVariablesController} = src('remote-variables/remote-variables.controller');
const {EndUsersService} = src('end-users/end-users.service');
const {EndUsersController} = src('end-users/end-users.controller');
const {ClientAuthController} = src('end-users/client-auth.controller');
const {AuthService} = src('auth/auth.service');
const {JwtStrategy} = src('auth/strategies/jwt.strategy');
const {SessionKeyStore} = src('common/services/session-key.store');
const {ResponseEncryptionInterceptor} = src('common/interceptors/response-encryption.interceptor');
const {App} = src('apps/entities/app.entity');
const {Device} = src('devices/entities/device.entity');
const checks = [];
async function check(name, fn) { try {checks.push({name, confirmed:true, evidence: await fn()});} catch(e) {checks.push({name, confirmed:false, error:e.stack});} }
const jwt = new JwtService({secret:'audit-only-synthetic-key', signOptions:{expiresIn:'1d'}});
const keys = new SessionKeyStore();
const fakeApp = {id:10, creator_id:2, app_secret:'synthetic-app-secret',is_active:true};
const state = {admin:{id:1, username:'synthetic-admin',role:'admin',balance:100, is_active:true}, calls:[]};
const userRepo = {
 create:x=>({...x}), save:async x=>{Object.assign(state.admin,x); return {...state.admin};},
 findOne:async()=>({...state.admin}), update:async(id,p)=>Object.assign(state.admin,p), remove:async()=>{},
};
const usersService = new UsersService(userRepo,{findRoleById:async id=>({id,name:'Super Admin'})},{logChange:async()=>{}},{});
const endRepo = {findOne:async ({where})=>({id:where.id, app_id:10, username:'synthetic-client',is_active:true,expire_time:null,max_devices:2})};
new JwtStrategy({get:()=> 'audit-only-synthetic-key'},endRepo,keys);
const mockEndService = {findOne:async id=>{state.calls.push(['end-user-detail',id]); if(Number.isNaN(id)) throw new BadRequestException('NaN reached detail');return endRepo.findOne({where:{id}});},
 refreshToken:()=> 'synthetic-new-token', clientLogin:async()=>({ok:true}), findAll:async()=>({list:[],total:0})};
const deviceRepo = {findOne:async()=>({id:9,hwid:'fake-hwid',end_user_id:77,is_banned:false}), save:async x=>x,count:async()=>1};
(async()=>{
 const mod = await Test.createTestingModule({
  imports:[ThrottlerModule.forRoot([{name:'redeem',ttl:60000,limit:10},{name:'login',ttl:60000,limit:30},{name:'register',ttl:60000,limit:5}])],
  controllers:[UsersController,AppsController,CardsController,DevicesController,CloudFunctionsController,RemoteVariablesController,EndUsersController,ClientAuthController],
  providers:[
   {provide:UsersService,useValue:usersService},
   {provide:AppsService,useValue:{findOne:async()=>({...fakeApp}),update:async(id,d)=>({id,...d})}},
   {provide:CardsService,useValue:{remove:async id=>({deleted:id}),useCard:async()=>({success:true})}},
   {provide:DevicesService,useValue:{banDevice:async id=>({id,is_banned:true}),findById:async id=>{state.calls.push(['device-detail',id]); if(Number.isNaN(id))throw new BadRequestException('NaN reached detail');return {id};}}},
   {provide:CloudFunctionsService,useValue:{update:async(id,d)=>({id,...d})}},
   {provide:RemoteVariablesService,useValue:{update:async(id,d)=>({id,...d})}},
   {provide:EndUsersService,useValue:mockEndService},
   {provide:getRepositoryToken(App),useValue:{findOne:async()=>({...fakeApp})}},
   {provide:getRepositoryToken(Device),useValue:deviceRepo},
  ]
 }).compile();
 const app = mod.createNestApplication();app.setGlobalPrefix('api');
 app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
 await app.init(); const http = app.getHttpServer();
 const clientToken = jwt.sign({sub:77,username:'synthetic-client',type:'end_user',app_id:10});
 const adminToken = jwt.sign({sub:1,role:'admin',permissions:['end-user:read']});
 await check('匿名旧注册保留管理员角色/角色ID/余额', async()=>{
  const r = await request(http).post('/api/users/register').send({username:'audit-user',password:'only-audit',role:'admin',role_id:1,balance:888});
  assert.equal(r.status,201);assert.equal(r.body.role,'admin');assert.equal(r.body.balance,888);return {status:r.status,role:r.body.role,role_id:r.body.role_id,balance:r.body.balance};
 });
 await check('终端用户JWT可重置后台其他管理员密码和余额', async()=>{
  const r = await request(http).put('/api/users/1').set('Authorization','Bearer '+clientToken).send({password:'replacement-audit',balance:999});
  assert.equal(r.status,200);assert.equal(state.admin.balance,999);assert(await bcrypt.compare('replacement-audit',state.admin.password));return {status:r.status,passwordReplaced:true,balance:state.admin.balance};
 });
 await check('匿名管理写接口可达', async()=>{
  const paths=[['put','/api/cloud/7',{code:'return 42;'}],['put','/api/remote-variables/7',{value:'audit'}],['put','/api/devices/7/ban',{reason:'audit'}],['delete','/api/cards/7',{}]];
  const statuses=[];for(const [method,path,body] of paths){const r=await request(http)[method](path).send(body);assert.equal(r.status,200);statuses.push({method,path,status:r.status});}return statuses;
 });
 await check('匿名应用详情暴露app_secret',async()=>{const r=await request(http).get('/api/apps/10');assert.equal(r.body.app_secret,fakeApp.app_secret);return {status:r.status,appSecretReturned:true};});
 await check('导出路由被:id抢先匹配',async()=>{
  const out=[];for(const path of ['/api/devices/export','/api/end-users/export']){const r=await request(http).get(path).set('Authorization','Bearer '+adminToken);assert.equal(r.status,400);out.push({path,status:r.status});}
  assert(state.calls.some(([name,id])=>name==='device-detail'&&Number.isNaN(id)));assert(state.calls.some(([name,id])=>name==='end-user-detail'&&Number.isNaN(id)));return {requests:out,detailReceivedNaN:true};
 });
 await check('未激活用户心跳被标记有效',async()=>{const r=await request(http).put('/api/client/heartbeat').set('Authorization','Bearer '+clientToken).send({hwid:'fake-hwid'});assert.equal(r.status,200);assert.equal(r.body.is_active,true);assert.equal(r.body.expire_time,null);return {is_active:r.body.is_active,expire_time:r.body.expire_time,success:r.body.success};});
 await check('登录限流被register策略压到5次',async()=>{const statuses=[];for(let i=0;i<6;i++){const r=await request(http).post('/api/client/login').send({username:'test',password:'test',app_id:10,hwid:'fake-hwid'});statuses.push(r.status);}assert.deepEqual(statuses,[201,201,201,201,201,429]);return statuses;});
 await app.close();
 await check('已启用2FA时任意非空验证码仍签发JWT',async()=>{const a=new AuthService({findById:async()=>({is_totp_enabled:true})},jwt);const r=await a.login({id:1,username:'audit',role:'admin',is_totp_enabled:true},'definitely-invalid');assert(r.access_token);return {tokenIssued:true};});
 await check('otplib实际安装版本不支持authenticator',async()=>{assert.equal(req('otplib').authenticator,undefined);const a=new AuthService({},jwt);await assert.rejects(()=>a.generateTotpSecret({id:1,username:'audit'}),TypeError);return {authenticator:'undefined',generateThrows:'TypeError'};});
 await check('后台JWT校验不查询后台账户状态',async()=>{let endLookups=0;const s=new JwtStrategy({get:()=> 'audit-only-synthetic-key'},{findOne:async()=>{endLookups++;throw Error('unexpected lookup');}},keys);const r=await s.validate({sub:123,role:'admin',permissions:['user:create']});assert.equal(endLookups,0);assert.equal(r.role,'admin');return {databaseLookups:0,acceptedRole:r.role};});
 const agent={id:3,userId:3,role:'agent',parent_id:2};
 function cardFixture({failure=false}={}){const balance={value:100,updates:0};const cs=new CardsService({create:x=>x,save:async x=>{if(failure)throw Error('synthetic save failure');return x;}},{update:async(id,x)=>{balance.value=x.balance;balance.updates++;}},null,null,{findOne:async()=>({id:4,creator_id:2,price:10,value:3600,device_limit:1,name:'fake-type'})},{findById:async()=>({id:3,role:'agent',balance:balance.value,agent:{discount_rate:100}})},{logChange:async()=>{}},{findOne:async()=>fakeApp},null);return {cs,balance};}
 await check('代理不传card_type_id可免费制卡',async()=>{const {cs,balance}=cardFixture();const cards=await cs.generate({app_id:10,count:1,value:86400},agent);assert.equal(cards.length,1);assert.equal(balance.updates,0);return {cards:cards.length,balance:balance.value,deductions:balance.updates};});
 await check('负数生成数量导致余额增加',async()=>{const {cs,balance}=cardFixture();const cards=await cs.generate({app_id:10,count:-2,card_type_id:4},agent);assert.equal(cards.length,0);assert.equal(balance.value,120);return {before:100,after:balance.value,cards:cards.length};});
 await check('卡密保存失败扣款没有回滚',async()=>{const {cs,balance}=cardFixture({failure:true});await assert.rejects(()=>cs.generate({app_id:10,count:2,card_type_id:4},agent));assert.equal(balance.value,80);return {before:100,after:balance.value,saveFailed:true};});
 await check('并发制卡两笔订单只扣一笔余额',async()=>{const {cs,balance}=cardFixture();const result=await Promise.all([cs.generate({app_id:10,count:6,card_type_id:4},agent),cs.generate({app_id:10,count:6,card_type_id:4},agent)]);assert.equal(balance.value,40);return {cards:result.flat().length,unitPrice:10,before:100,after:balance.value};});
 await check('同一卡密并发兑换两位用户都获得授权',async()=>{
  const base={id:4,code:'synthetic-code',status:'unused',value:3600,app_id:10,creator_id:2,device_limit:1,is_permanent:false};const updated=[];
  const service=new CardsService({findOne:async()=>({...base}),query:async()=>{}},null,{findOne:async id=>({id,app_id:10,max_devices:1,expire_time:null}),update:async(id,patch)=>updated.push({id,expire_time:patch.expire_time})},null,null,null,null,null,null);
  const r=await Promise.all([service.useCard('synthetic-code',101,null),service.useCard('synthetic-code',102,null)]);assert.equal(updated.length,2);assert(r.every(x=>x.success));return {successfulRedemptions:r.length,users:updated.map(x=>x.id)};
 });
 await check('同账号第二设备登录覆盖第一设备加密密钥',async()=>{
  process.env.RESPONSE_ENCRYPTION='true';const store=new SessionKeyStore();const interceptor=new ResponseEncryptionInterceptor(store);
  const a=crypto.generateKeyPairSync('rsa',{modulusLength:2048});const b=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
  store.setSessionKey(77,a.publicKey.export({type:'spki',format:'pem'}));store.setSessionKey(77,b.publicKey.export({type:'spki',format:'pem'}));
  const response=await lastValueFrom(interceptor.intercept({switchToHttp:()=>({getRequest:()=>({path:'/api/client/heartbeat',user:{userId:77}})})},{handle:()=>of({success:true})}));
  const decode=privateKey=>crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(response.key,'base64'));
  assert.throws(()=>decode(a.privateKey));assert.equal(decode(b.privateKey).length,48);return {deviceADecrypts:false,deviceBDecrypts:true};
 });
 await check('PostgreSQL元数据不接受现有datetime字段',async()=>{
  const {DataSource}=req('typeorm');const ds=new DataSource({type:'postgres',entities:[require('./bootstrap.cjs').root+'/backend/src/**/*.entity.ts']});
  await assert.rejects(()=>ds.buildMetadatas(),e=>/datetime/.test(e.message));return {connectionAttempted:false,metadataValidation:'datetime unsupported'};
 });
 console.log(JSON.stringify({checks,total:checks.length,confirmed:checks.filter(x=>x.confirmed).length},null,2));
 process.exitCode=checks.some(x=>!x.confirmed)?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
