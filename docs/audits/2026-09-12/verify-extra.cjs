const {req,src,root}=require('./bootstrap.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const crypto=require('node:crypto');
const {DataSource}=req('typeorm');
const {BalanceLogsService}=src('balance-logs/balance-logs.service');
const {BalanceLog}=src('balance-logs/entities/balance-log.entity');
const {EndUsersService}=src('end-users/end-users.service');
const {SessionKeyStore}=src('common/services/session-key.store');
const {DevicesService}=src('devices/devices.service');
const {AgentsService}=src('agents/agents.service');
const {SignatureGuard}=src('common/guards/signature.guard');
const {Reflector}=req('@nestjs/core');
const checks=[];
async function check(name,fn){try{checks.push({name,confirmed:true,evidence:await fn()});}catch(e){checks.push({name,confirmed:false,error:e.stack});}}
(async()=>{
 await check('余额统计SUM查询丢失用户过滤条件',async()=>{
  const ds=new DataSource({type:'mysql',database:'synthetic_audit',entities:[root+'/backend/src/**/*.entity.ts']});await ds.buildMetadatas();
  const sql=[];function wrap(qb){const clone=qb.clone.bind(qb);qb.clone=()=>wrap(clone());qb.getCount=async()=>0;qb.getMany=async()=>[];qb.getRawOne=async()=>{sql.push(qb.getSql());return {total:0};};return qb;}
  const service=new BalanceLogsService({createQueryBuilder:alias=>wrap(ds.getRepository(BalanceLog).createQueryBuilder(alias))},null);
  await service.getStatistics(42);assert.equal(sql.length,2);assert(sql.every(x=>!x.split(' WHERE ')[1].includes('user_id')));return sql;
 });
 await check('切换登录HWID可抹掉原机器试用记录后再领试用',async()=>{
  const rows=[],devices=[];let nextId=1;
  const repo={create:x=>({...x}),save:async x=>{const row={id:nextId++,...x};rows.push(row);return row;},findOne:async({where})=>rows.find(r=>Object.entries(where).every(([k,v])=>r[k]===v))||null,update:async(id,p)=>Object.assign(rows.find(x=>x.id===id),p),createQueryBuilder:()=>{let username,appId;const q={where:(s,p)=>{username=p.username;return q;},andWhere:(s,p)=>{appId=p.appId;return q;},addSelect:()=>q,getOne:async()=>({...rows.find(x=>x.username===username&&x.app_id===appId)})};return q;}};
  const devRepo={findOne:async()=>null,count:async()=>devices.length,create:x=>({...x}),save:async x=>{devices.push(x);return x;}};
  const apps={findOne:async()=>({id:10,is_active:true,trial_enabled:true,trial_duration:60,trial_device_limit:1})};
  const svc=new EndUsersService(repo,devRepo,apps,{}, {sign:()=> 'synthetic-token'},new SessionKeyStore());
  const first=await svc.clientRegister({username:'audit-one',password:'audit-pass',app_id:10,hwid:'device-A'});
  await svc.clientLogin({username:'audit-one',password:'audit-pass',app_id:10,hwid:'device-B'});
  const second=await svc.clientRegister({username:'audit-two',password:'audit-pass',app_id:10,hwid:'device-A'});
  assert(first.trial_granted&&second.trial_granted);return {firstTrial:first.trial_granted,firstUserNowHwid:rows[0].hwid,secondTrialSameOriginalHwid:second.trial_granted};
 });
 await check('旧代理制卡接口未验证应用归属并接受负数数量',async()=>{
  let balance=10;const svc=new AgentsService({findOne:async()=>({discount_rate:100,user:{balance}})},{update:async(id,p)=>balance=p.balance},{save:async rows=>rows},null,{logChange:async()=>{}});
  const r=await svc.generateCards(3,86400,999,-2);assert.equal(balance,12);assert.equal(r.created,0);return {before:10,after:balance,uncheckedAppId:999,cards:r.created};
 });
 await check('同HWID设备旧绑定方法抢占其他用户记录',async()=>{
  const row={id:8,hwid:'shared-hwid',end_user_id:101,app_id:10};const svc=new DevicesService({findOne:async()=>({...row}),save:async x=>Object.assign(row,x)},null,null);
  await svc.bindToUser('shared-hwid',102,10,true);assert.equal(row.end_user_id,102);return {beforeUser:101,afterUser:row.end_user_id};
 });
 await check('Python浮点JSON与服务端重序列化导致签名不同',async()=>{
  const py=spawnSync('python3',['-c','import json; print(json.dumps({"data":{"amount":1.0}},separators=(",",":"),ensure_ascii=False))'],{encoding:'utf8'});assert.equal(py.status,0);const body=py.stdout.trim();const serverBody=JSON.stringify(JSON.parse(body));assert.notEqual(body,serverBody);
  const sig=x=>crypto.createHmac('sha256','synthetic-secret').update(x).digest('hex');assert.notEqual(sig(body),sig(serverBody));return {sdk:body,server:serverBody,signaturesMatch:false};
 });
 await check('签名可重放且同一应用内不绑定接口路径',async()=>{
  const guard=new SignatureGuard({findOne:async()=>({id:10,is_active:true,app_secret:'synthetic-secret'})},new Reflector());const stamp=String(Math.floor(Date.now()/1000)),nonce='synthetic-once';const sig=crypto.createHmac('sha256','synthetic-secret').update(`app_id=10&nonce=${nonce}&timestamp=${stamp}`).digest('hex');
  function ctx(path){return {getHandler:()=>function route(){},switchToHttp:()=>({getRequest:()=>({headers:{'x-timestamp':stamp,'x-nonce':nonce,'x-signature':sig,'x-app-id':'10'},query:{},body:{},params:{appId:'10'},path})})};}
  const a=await guard.canActivate(ctx('/api/remote-variables/app/10'));const b=await guard.canActivate(ctx('/api/remote-variables/app/10'));const c=await guard.canActivate(ctx('/api/cloud/run/10/synthetic'));assert(a&&b&&c);return {firstAccepted:a,replayAccepted:b,otherPathAccepted:c};
 });
 console.log(JSON.stringify({checks,total:checks.length,confirmed:checks.filter(x=>x.confirmed).length},null,2));process.exitCode=checks.some(x=>!x.confirmed)?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
