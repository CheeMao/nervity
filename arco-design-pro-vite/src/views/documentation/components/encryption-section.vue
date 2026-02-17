<template>
  <div class="encryption-section">
    <a-typography>
      <a-typography-title :heading="2">数据加密</a-typography-title>
      <a-typography-paragraph>
        系统支持 RSA+AES 混合加密，用于保护敏感数据的传输安全。 混合加密结合了
        RSA 的安全性和 AES 的高效性。
      </a-typography-paragraph>
    </a-typography>

    <!-- 获取公钥 -->
    <a-card class="api-card" title="GET /encryption/public-key">
      <template #extra>
        <a-tag color="green">公开接口</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">GET</a-descriptions-item>
        <a-descriptions-item label="认证">无需</a-descriptions-item>
        <a-descriptions-item label="描述"
          >获取RSA公钥，用于混合加密</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">请求示例</a-typography-title>
      <a-card class="code-card">
        <pre class="code-block">GET /api/encryption/public-key</pre>
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "获取成功",
  "data": {
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
  }
}</pre
        >
      </a-card>
    </a-card>

    <!-- 混合加密流程 -->
    <a-card class="api-card" title="RSA+AES 混合加密流程">
      <a-steps :current="-1" direction="vertical">
        <a-step title="1. 获取 RSA 公钥">
          <template #description>
            <p
              >调用 <code>GET /encryption/public-key</code> 获取服务器的 RSA
              公钥。</p
            >
          </template>
        </a-step>
        <a-step title="2. 生成随机 AES 密钥">
          <template #description>
            <p>客户端生成一个随机的 AES-256 密钥（32字节）和 IV（16字节）。</p>
            <a-card class="code-card">
              <pre class="code-block">
// Python 示例
from Crypto.Random import get_random_bytes

aes_key = get_random_bytes(32)  # 256位密钥
aes_iv = get_random_bytes(16)   # 128位IV</pre
              >
            </a-card>
          </template>
        </a-step>
        <a-step title="3. 使用 AES 加密请求数据">
          <template #description>
            <p>使用生成的 AES 密钥对请求体进行 AES-CBC 加密。</p>
            <a-card class="code-card">
              <pre class="code-block">
// Python 示例
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import base64

def aes_encrypt(data: dict, key: bytes, iv: bytes) -> str:
    cipher = AES.new(key, AES.MODE_CBC, iv)
    json_data = json.dumps(data, separators=(',', ':'))
    encrypted = cipher.encrypt(pad(json_data.encode(), AES.block_size))
    return base64.b64encode(encrypted).decode()

encrypted_data = aes_encrypt(
    {"username": "test", "password": "123456"},
    aes_key,
    aes_iv
)</pre
              >
            </a-card>
          </template>
        </a-step>
        <a-step title="4. 使用 RSA 加密 AES 密钥">
          <template #description>
            <p>使用服务器的 RSA 公钥加密 AES 密钥和 IV。</p>
            <a-card class="code-card">
              <pre class="code-block">
// Python 示例
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
import base64
import json

def rsa_encrypt_key(key: bytes, iv: bytes, public_key_pem: str) -> str:
    public_key = RSA.import_key(public_key_pem)
    cipher = PKCS1_v1_5.new(public_key)

    # 将密钥和IV组合后加密
    key_data = json.dumps({
        'key': base64.b64encode(key).decode(),
        'iv': base64.b64encode(iv).decode()
    })

    encrypted = cipher.encrypt(key_data.encode())
    return base64.b64encode(encrypted).decode()

encrypted_key = rsa_encrypt_key(aes_key, aes_iv, public_key)</pre
              >
            </a-card>
          </template>
        </a-step>
        <a-step title="5. 发送加密请求">
          <template #description>
            <p
              >发送加密后的数据和加密后的密钥，并设置
              <code>x-encryption: true</code> 请求头。</p
            >
            <a-card class="code-card">
              <pre class="code-block">
// 请求格式
POST /api/client/login
Content-Type: application/json
x-encryption: true

{
  "data": "Base64编码的AES加密数据",
  "key": "Base64编码的RSA加密密钥"
}</pre
              >
            </a-card>
          </template>
        </a-step>
        <a-step title="6. 接收加密响应">
          <template #description>
            <p>如果响应也进行了加密，使用保存的 AES 密钥解密响应数据。</p>
          </template>
        </a-step>
      </a-steps>
    </a-card>

    <!-- 完整示例代码 -->
    <a-card class="api-card" title="完整示例代码">
      <a-typography-title :heading="4">Python 完整示例</a-typography-title>
      <a-card class="code-card">
        <pre class="code-block">
import requests
import json
import base64
from Crypto.Random import get_random_bytes
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA
from Crypto.Util.Padding import pad, unpad

class EncryptionClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.public_key = None

    def get_public_key(self) -> str:
        """获取服务器公钥"""
        response = requests.get(f"{self.base_url}/encryption/public-key")
        self.public_key = response.json()['data']['publicKey']
        return self.public_key

    def aes_encrypt(self, data: dict, key: bytes, iv: bytes) -> str:
        """AES加密数据"""
        cipher = AES.new(key, AES.MODE_CBC, iv)
        json_data = json.dumps(data, separators=(',', ':'))
        encrypted = cipher.encrypt(pad(json_data.encode(), AES.block_size))
        return base64.b64encode(encrypted).decode()

    def aes_decrypt(self, encrypted_data: str, key: bytes, iv: bytes) -> dict:
        """AES解密数据"""
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted = unpad(
            cipher.decrypt(base64.b64decode(encrypted_data)),
            AES.block_size
        )
        return json.loads(decrypted.decode())

    def rsa_encrypt_key(self, key: bytes, iv: bytes) -> str:
        """RSA加密AES密钥"""
        rsa_key = RSA.import_key(self.public_key)
        cipher = PKCS1_v1_5.new(rsa_key)

        key_data = json.dumps({
            'key': base64.b64encode(key).decode(),
            'iv': base64.b64encode(iv).decode()
        })

        encrypted = cipher.encrypt(key_data.encode())
        return base64.b64encode(encrypted).decode()

    def encrypted_request(self, method: str, endpoint: str, data: dict) -> dict:
        """发送加密请求"""
        if not self.public_key:
            self.get_public_key()

        # 生成AES密钥
        aes_key = get_random_bytes(32)
        aes_iv = get_random_bytes(16)

        # 加密数据
        encrypted_data = self.aes_encrypt(data, aes_key, aes_iv)
        encrypted_key = self.rsa_encrypt_key(aes_key, aes_iv)

        # 发送请求
        url = f"{self.base_url}{endpoint}"
        headers = {'x-encryption': 'true'}
        payload = {'data': encrypted_data, 'key': encrypted_key}

        response = requests.post(url, json=payload, headers=headers)
        result = response.json()

        # 如果响应也是加密的，解密
        if result.get('data', {}).get('encrypted'):
            decrypted = self.aes_decrypt(
                result['data']['encrypted'],
                aes_key,
                aes_iv
            )
            result['data'] = decrypted

        return result

# 使用示例
client = EncryptionClient('http://localhost:3000/api')

# 加密登录
result = client.encrypted_request('POST', '/client/login', {
    'username': 'testuser',
    'password': 'password123',
    'app_id': 1
})

print(result)</pre
        >
      </a-card>

      <a-typography-title :heading="4" style="margin-top: 24px"
        >C# 完整示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Security.Cryptography;

public class EncryptionClient
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private string _publicKey;
    private byte[] _aesKey;
    private byte[] _aesIv;

    public EncryptionClient(string baseUrl)
    {
        _baseUrl = baseUrl;
        _httpClient = new HttpClient();
    }

    public async Task GetPublicKeyAsync()
    {
        var response = await _httpClient.GetAsync($"{_baseUrl}/encryption/public-key");
        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize&lt;JsonElement&gt;(json);
        _publicKey = result.GetProperty("data").GetProperty("publicKey").GetString();
    }

    public async Task&lt;JsonElement&gt; EncryptedRequestAsync(string endpoint, object data)
    {
        if (_publicKey == null)
            await GetPublicKeyAsync();

        // 生成AES密钥
        using var aes = Aes.Create();
        aes.KeySize = 256;
        aes.GenerateKey();
        aes.GenerateIV();
        _aesKey = aes.Key;
        _aesIv = aes.IV;

        // AES加密数据
        var jsonData = JsonSerializer.Serialize(data);
        var encryptedData = AesEncrypt(jsonData, _aesKey, _aesIv);

        // RSA加密密钥
        var encryptedKey = RsaEncryptKey(_aesKey, _aesIv);

        // 发送请求
        var payload = new { data = encryptedData, key = encryptedKey };
        var content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json"
        );
        content.Headers.Add("x-encryption", "true");

        var response = await _httpClient.PostAsync($"{_baseUrl}{endpoint}", content);
        var responseJson = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize&lt;JsonElement&gt;(responseJson);
    }

    private string AesEncrypt(string data, byte[] key, byte[] iv)
    {
        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var encryptor = aes.CreateEncryptor();
        var dataBytes = Encoding.UTF8.GetBytes(data);
        var encrypted = encryptor.TransformFinalBlock(dataBytes, 0, dataBytes.Length);
        return Convert.ToBase64String(encrypted);
    }

    private string RsaEncryptKey(byte[] key, byte[] iv)
    {
        using var rsa = RSA.Create();
        rsa.ImportFromPem(_publicKey);

        var keyData = JsonSerializer.Serialize(new
        {
            key = Convert.ToBase64String(key),
            iv = Convert.ToBase64String(iv)
        });

        var encrypted = rsa.Encrypt(
            Encoding.UTF8.GetBytes(keyData),
            RSAEncryptionPadding.Pkcs1
        );
        return Convert.ToBase64String(encrypted);
    }
}

// 使用示例
var client = new EncryptionClient("http://localhost:3000/api");
var result = await client.EncryptedRequestAsync("/client/login", new
{
    username = "testuser",
    password = "password123",
    app_id = 1
});
Console.WriteLine(result);</pre
        >
      </a-card>
    </a-card>

    <!-- 使用建议 -->
    <a-card class="api-card" title="使用建议">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card class="tip-card" :bordered="false">
            <template #title>
              <icon-check-circle-fill
                style="color: #00b42a; margin-right: 8px"
              />
              推荐使用场景
            </template>
            <ul>
              <li>用户登录（传输密码）</li>
              <li>用户注册（传输密码）</li>
              <li>修改密码</li>
              <li>支付信息</li>
              <li>其他敏感个人信息</li>
            </ul>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card class="tip-card warning" :bordered="false">
            <template #title>
              <icon-exclamation-circle-fill
                style="color: #ff7d00; margin-right: 8px"
              />
              注意事项
            </template>
            <ul>
              <li>RSA 加密有数据长度限制，不要直接加密大量数据</li>
              <li>每次请求应使用新的随机 AES 密钥</li>
              <li>妥善保管 AES 密钥直到请求完成</li>
              <li>HTTPS 环境下加密是可选的额外保护</li>
            </ul>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
  .encryption-section {
    padding: 0 8px;
  }

  .api-card {
    margin-bottom: 24px;
  }

  .code-card {
    background: #1e1e1e;
    border-radius: 8px;
  }

  .code-block {
    color: #d4d4d4;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .tip-card {
    background: #f7f8fa;
    height: 100%;
  }

  .tip-card.warning {
    background: #fffbe8;
  }

  :deep(.arco-steps-item-description) {
    padding-left: 8px;
  }
</style>
