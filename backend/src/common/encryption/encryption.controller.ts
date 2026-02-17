import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { EncryptionService } from "./encryption.service";

@ApiTags('加密服务 (Encryption)')
@Controller("encryption")
export class EncryptionController {
  constructor(private readonly encryptionService: EncryptionService) {}

  @Get("public-key")
  @ApiOperation({ summary: '获取RSA公钥', description: '获取用于混合加密的RSA公钥' })
  @ApiResponse({ status: 200, description: '成功', schema: {
    type: 'object',
    properties: {
      publicKey: { type: 'string', description: 'RSA公钥（PEM格式）' },
    },
  }})
  getPublicKey() {
    return {
      publicKey: this.encryptionService.getPublicKey(),
    };
  }
}
