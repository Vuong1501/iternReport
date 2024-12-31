import userGroups from './vi-Vn/userGroups';
import menus from './vi-Vn/menus';
import menuPositions from './vi-Vn/menuPositions';
import users from './vi-Vn/users';
import provinces from './vi-Vn/provinces';
import districts from './vi-Vn/districts';
import product from './vi-Vn/product';
import order from './vi-Vn/order';
import post from './vi-Vn/post';
import friend from './vi-Vn/friend';
import comment from './vi-Vn/comment';
import message from './vi-Vn/message';

export default {
  menus: 'Menu',
  orderBy: 'Thứ tự',
  order: 'dat hang', // TODO

  orderHome: 'Thứ tự trang chính',
  users: 'Tài khoản',
  points: 'tọa độ polygon',
  districtsId: 'id huyện',
  menuPositions: 'Vị trí menus',
  notes: 'Ghi chú',
  openShedules: 'Lịch mở cửa',

  type: 'Kiểu danh mục',

  groupsUsers: 'Nhóm tài khoản',
  userGroups: 'Nhóm tài khoản',
  userCreatorsId: 'Người tạo',
  user_id: 'Người mua hàng',
  usersId: 'Người quản lý',
  status: 'Trạng thái',
  FromDate: 'Ngày bắt đầu tìm kiếm',
  ToDate: 'Ngày kết thúc tìm kiếm',
  provincesId: 'Id thành phố',
  logo: 'Logo',
  icon: 'icon',
  flag: 'Flag xoá/thêm-sửa',
  UrlSlugs: 'UrlSlugs',
  menuPositionsId: 'Id vị trí Menu',
  menusId: 'Id menus',
  groupsUsersId: 'Id nhóm tài khoản',
  userGroupsId: 'Id nhóm tài khoản',
  dateUpdated: 'Ngày cập nhật',
  created_at: 'Ngày mua hàng',
  dateCreated: 'ngày tạo',
  image: 'Hình ảnh',
  parentId: 'id bản ghi cấp trên',
  'api.message.infoError': 'Lấy thông tin xác thực thất bại!',
  'api.message.infoAfterCreateError': 'Lỗi không lấy được bản ghi mới sau khi tạo thành công',
  'api.message.infoAfterEditError': 'Lấy thông tin sau khi thay đổi thất bại',
  'api.message.notExisted': 'Bản ghi này không tồn tại!',
  'api.servicePackages.featureName': 'Tên tính năng',

  ...menuPositions,
  ...menus,

  ...users,

  ...userGroups,

  ...provinces,
  ...districts,
  ...product,
  ...order,
  ...post,
  ...friend,
  ...comment,
  ...message,
};
