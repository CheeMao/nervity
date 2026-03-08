import Mock from 'mockjs';

import './user';
import './message-box';

// 只导入实际存在的 mock 文件
import '@/views/dashboard/workplace/mock';
import '@/views/user/setting/mock';

Mock.setup({
  timeout: '600-1000',
});
