#!/usr/bin/env python3
"""
NetVerify Client SDK 使用示例

演示如何使用 SDK 进行注册、登录、充值、心跳等操作。
SDK 会自动生成临时 RSA 密钥对用于加密通信，无需手动管理密钥。
"""

import time
from netverify_client import NetVerifyClient, NetVerifyError, create_client


def example_basic_usage():
    """
    基本使用示例
    """
    # ============ 配置信息（请根据实际情况修改） ============
    APP_ID = 2                                      # 应用 ID
    APP_SECRET = "pbhYcVkxUeblvRIHXkILfjj9GJGiFMeP" # 应用密钥（从后台获取）
    BASE_URL = "http://localhost:3000/api"          # API 地址

    # ============ 1. 初始化客户端 ============
    # SDK 自动生成临时 RSA 密钥对，无需手动传入私钥
    # 私钥仅存在于内存中，进程退出即销毁
    client = NetVerifyClient(
        base_url=BASE_URL,
        app_id=APP_ID,
        app_secret=APP_SECRET,
        timeout=30
    )

    print("=" * 50)
    print("1. 获取应用信息")
    print("=" * 50)
    try:
        result = client.get_app_info()
        app = result.get("data", {})
        print(result)
        print(f"应用名称: {app.get('name')}")
        print(f"当前版本: {app.get('version')}")
        print(f"下载地址: {app.get('download_url')}")
        print(f"强制更新: {app.get('force_update')}")
        print(f"心跳间隔: {app.get('heart_interval')} 秒")
        print(f"是否启用试用: {app.get('trial_enabled')}")
    except NetVerifyError as e:
        print(f"获取应用信息失败: {e}")

    # ============ 2. 用户注册 ============
    print("\n" + "=" * 50)
    print("2. 用户注册")
    print("=" * 50)
    username = "test_user_002"
    password = "password123"
    hwid = "DEVICE-HWID-001"

    try:
        result = client.register(username, password, hwid)
        print(f"注册成功! 用户ID: {result['data']['id']}")
    except NetVerifyError as e:
        if "已存在" in str(e):
            print(f"用户已存在，跳过注册")
        else:
            print(f"注册失败: {e}")

    # ============ 3. 用户登录 ============
    # 登录时 SDK 自动将会话公钥发送给服务端
    # 服务端后续用此公钥加密响应，只有本客户端能解密
    print("\n" + "=" * 50)
    print("3. 用户登录")
    print("=" * 50)
    try:
        result = client.login(username, password, hwid)
        print(result)
        data = result.get("data", {})
        user = data.get("user", {})
        print(f"登录成功!")
        print(f"用户名: {user.get('username')}")
        print(f"是否有效: {data.get('is_valid')}")
        print(f"状态说明: {data.get('valid_message')}")
        print(f"到期时间: {data.get('expire_time')}")
        print(f"最大设备数: {user.get('max_devices')}")
    except NetVerifyError as e:
        print(f"登录失败: {e}")
        return

    # ============ 4. 获取用户信息 ============
    print("\n" + "=" * 50)
    print("4. 获取当前用户信息")
    print("=" * 50)
    try:
        result = client.get_profile()
        print(result)
        user = result.get("data", {})
        print(f"用户ID: {user.get('id')}")
        print(f"用户名: {user.get('username')}")
        print(f"到期时间: {user.get('expire_time')}")
    except NetVerifyError as e:
        print(f"获取用户信息失败: {e}")

    # ============ 5. 充值（兑换卡密） ============
    print("\n" + "=" * 50)
    print("5. 充值（兑换卡密）")
    print("=" * 50)
    card_code = "8AH7SA6HBR"  # 替换为实际的卡密
    if card_code != "YOUR_CARD_CODE_HERE":
        try:
            result = client.recharge(card_code)
            print(f"充值成功!")
            print(f"增加时长: {result['data'].get('added_seconds')} 秒")
            print(f"新到期时间: {result['data'].get('new_expire_time')}")
        except NetVerifyError as e:
            print(f"充值失败: {e}")
    else:
        print("(跳过充值示例，请设置有效的卡密)")

    # ============ 6. 发送心跳 ============
    # 心跳成功时 SDK 自动更新 token（服务端返回新 token 续期）
    # JWT 有效期为 2 小时，通过心跳自动续期
    print("\n" + "=" * 50)
    print("6. 发送心跳")
    print("=" * 50)
    try:
        result = client.heartbeat(hwid)
        print(result)
        data = result.get("data", {})
        print(f"心跳成功: {data.get('success')}")
        print(f"用户有效: {data.get('is_active')}")
        print(f"建议心跳间隔: {data.get('interval')} 秒")
        print(f"心跳超时: {data.get('heartbeat_timeout')} 秒")
        print(f"已绑定设备: {data.get('bound_devices')}/{data.get('max_devices')}")

        commands = data.get("commands", [])
        if commands:
            print(f"服务器命令: {commands}")
            if "force_logout" in commands:
                print("收到强制登出命令，应停止使用!")
    except NetVerifyError as e:
        print(f"心跳失败: {e}")

    # ============ 7. 查询到期时间 ============
    print("\n" + "=" * 50)
    print("7. 查询到期时间")
    print("=" * 50)
    try:
        result = client.get_expire_time()
        print(result)
        data = result.get("data", {})
        print(f"用户名: {data.get('username')}")
        print(f"是否有效: {data.get('is_valid')}")
        print(f"到期时间: {data.get('expire_time')}")

        remaining = data.get("remaining_seconds", 0)
        if remaining > 0:
            days = remaining // 86400
            hours = (remaining % 86400) // 3600
            print(f"剩余时间: {days} 天 {hours} 小时")
        else:
            print(f"状态说明: {data.get('valid_message')}")
    except NetVerifyError as e:
        print(f"查询到期时间失败: {e}")

    # ============ 8. 获取远程变量 ============
    print("\n" + "=" * 50)
    print("8. 获取远程变量")
    print("=" * 50)
    try:
        # 获取所有变量（列表格式）
        result = client.get_remote_variables()
        print(result)
        variables = result.get("data", {}).get("list", [])
        print(f"共有 {len(variables)} 个远程变量:")
        for var in variables[:5]:  # 只显示前5个
            print(f"  - {var.get('key')}: {var.get('value')}")
    except NetVerifyError as e:
        print(f"获取远程变量失败: {e}")

    try:
        # 获取所有变量（对象格式）
        result = client.get_remote_variables_as_object()
        print(result)
        data = result.get("data", {})
        print(f"\n对象格式: {list(data.keys())[:5]}...")

        # 获取单个变量
        if data:
            first_key = list(data.keys())[0]
            print(first_key)
            result = client.get_remote_variable(first_key)
            var = result.get("data", {})
            print(f"\n单个变量 '{first_key}':")
            print(f"  值: {var.get('value')}")
            print(f"  描述: {var.get('description')}")
    except NetVerifyError as e:
        print(f"获取远程变量详情失败: {e}")

    # ============ 9. 执行云函数 ============
    print("\n" + "=" * 50)
    print("9. 执行云函数")
    print("=" * 50)
    try:
        result = client.run_cloud_function(
            trigger_name="test_function",
            data={"param1": 222, "param2": 123}
        )
        print(f"云函数执行成功!")
        print(result)
        print(f"返回结果: {result.get('data')}")
    except NetVerifyError as e:
        print(f"云函数执行失败: {e}")

    print("\n" + "=" * 50)
    print("示例完成!")
    print("=" * 50)


def example_trial():
    """
    试用激活示例
    """
    print("\n" + "=" * 50)
    print("试用激活示例")
    print("=" * 50)

    client = NetVerifyClient(
        base_url="http://localhost:3000/api",
        app_id=1
    )

    hwid = "NEW-DEVICE-HWID-002"

    try:
        result = client.trial(hwid)
        data = result.get("data", {})
        print(f"试用激活成功!")
        print(f"增加时长: {data.get('added_seconds')} 秒")
        print(f"到期时间: {data.get('expire_time')}")
        print(f"设备限制: {data.get('max_devices')} 台")
    except NetVerifyError as e:
        print(f"试用激活失败: {e}")


def example_heartbeat_loop():
    """
    心跳循环示例

    演示如何在循环中发送心跳并处理服务器命令。
    JWT token 有效期为 2 小时，心跳成功时 SDK 自动续期。
    """
    print("\n" + "=" * 50)
    print("心跳循环示例")
    print("=" * 50)

    # 使用便捷函数创建并登录
    client = create_client(
        base_url="http://localhost:3000/api",
        app_id=1,
        username="test_user_001",
        password="password123",
        hwid="DEVICE-HWID-001"
    )

    print("开始心跳循环 (按 Ctrl+C 停止)...")

    try:
        while True:
            result = client.heartbeat("DEVICE-HWID-001")
            data = result.get("data", {})

            # 检查用户状态
            if not data.get("is_active"):
                print("用户已失效，停止心跳")
                break

            # 检查服务器命令
            commands = data.get("commands", [])
            if "force_logout" in commands:
                print(f"收到强制登出命令: {data.get('message')}")
                break

            # 等待下次心跳（token 已在 heartbeat() 中自动续期）
            interval = data.get("interval", 60)
            print(f"心跳正常，{interval}秒后发送下一次...")
            time.sleep(interval)

    except KeyboardInterrupt:
        print("\n用户中断，停止心跳")
    except NetVerifyError as e:
        print(f"心跳错误: {e}")


def example_error_handling():
    """
    错误处理示例

    演示如何处理各种错误情况。
    """
    print("\n" + "=" * 50)
    print("错误处理示例")
    print("=" * 50)

    client = NetVerifyClient(
        base_url="http://localhost:3000/api",
        app_id=1
    )

    # 错误的密码
    print("\n测试错误密码:")
    try:
        client.login("test_user_001", "wrong_password", "DEVICE-HWID-001")
    except NetVerifyError as e:
        print(f"捕获错误: code={e.code}, message={e.message}")

    # 无效的卡密
    print("\n测试无效卡密:")
    try:
        client.login("test_user_001", "password123", "DEVICE-HWID-001")
        client.recharge("INVALID_CODE")
    except NetVerifyError as e:
        print(f"捕获错误: code={e.code}, message={e.message}")

    # 未登录时调用需要认证的接口
    print("\n测试未认证访问:")
    client2 = NetVerifyClient("http://localhost:3000/api", 1)
    try:
        client2.heartbeat("DEVICE-HWID-001")
    except NetVerifyError as e:
        print(f"捕获错误: code={e.code}, message={e.message}")


if __name__ == "__main__":
    # 运行基本示例
    example_basic_usage()

    # 取消注释以运行其他示例:
    # example_trial()
    # example_heartbeat_loop()
    # example_error_handling()
