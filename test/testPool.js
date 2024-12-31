// import config from "../config.js";

// // async function testConnection() {

// //     try {
// //         const [rows] = await config.sql.pool.promise().query('SELECT 1 + 1 AS result');
// //         console.log('Kết quả truy vấn:', rows);
// //     } catch (error) {
// //         console.error('Lỗi kết nối cơ sở dữ liệu:', error);
// //     }
// // }

// // testConnection();


// // Lấy kết nối từ pool
// const pool = config.sql.pool;


// const tongDoanhThuTheoSanPham = (startDate = null, endDate = null) => {
//     return new Promise((resolve, reject) => {
//         const query = 'CALL tongDoanhThuTheoSanPham(?, ?)';

//         // Thực thi truy vấn
//         pool.execute(query, [startDate, endDate], (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(results[0]);
//         });
//     });
// };

// const startDate = '2023-01-01';
// const endDate = '2023-10-01';
// tongDoanhThuTheoSanPham(startDate, endDate)
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((err) => {
//         console.error('Lỗi truy vấn:', err);
//     });
