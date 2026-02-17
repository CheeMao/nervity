"""
NetVerify Client SDK

用于与 NetVerify 服务器进行通信的 Python 客户端库。
"""

from .netverify_client import (
    NetVerifyClient,
    NetVerifyError,
    create_client,
)

__version__ = "1.0.0"
__all__ = [
    "NetVerifyClient",
    "NetVerifyError",
    "create_client",
]
