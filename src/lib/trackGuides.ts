export const TRACK_GUIDES: Record<string, { description: string, sprints: { name: string, dod: string }[] }> = {
  SOFTWARE_DEVELOPMENT: {
    description: "Phát triển phần mềm (Web, Mobile, Backend, etc.)",
    sprints: [
      { name: "Sprint 1", dod: "Dựng xong Runnable skeleton / MVP. Khởi tạo Database Schema và lên danh sách API cơ bản." },
      { name: "Sprint 2", dod: "Tích hợp UI và API. Hoàn thành 50% tính năng cốt lõi (Core Features). CI/CD chạy thành công." },
      { name: "Sprint 3", dod: "Hoàn thiện 100% tính năng cốt lõi. Viết Unit Test cơ bản. Không còn lỗi Critical/Blocker." },
      { name: "Sprint 4", dod: "Đóng gói & Triển khai (Deploy/Docker). Hoàn thiện tài liệu kĩ thuật (README, API Docs)." },
    ]
  },
  DATA_ANALYTICS: {
    description: "Phân tích Dữ liệu & Business Intelligence",
    sprints: [
      { name: "Sprint 1", dod: "Hoàn thiện Data Dictionary. Chạy xong EDA (Khám phá dữ liệu). Chốt danh sách KPI/Metrics." },
      { name: "Sprint 2", dod: "Hoàn thiện Data Cleaning & ETL Pipeline. Lên bản nháp (Draft) Dashboard đầu tiên." },
      { name: "Sprint 3", dod: "Dashboard hoàn thiện biểu đồ & UI/UX. Số liệu chính xác, filter hoạt động mượt mà." },
      { name: "Sprint 4", dod: "Tối ưu hóa tốc độ Query. Viết báo cáo Insights & Khuyến nghị kinh doanh (Slide/Doc)." },
    ]
  },
  AI_ML_RESEARCH: {
    description: "Trí tuệ nhân tạo & Máy học",
    sprints: [
      { name: "Sprint 1", dod: "Khảo sát tài liệu (Literature Review). Thu thập và gán nhãn xong Dataset. Chạy baseline model." },
      { name: "Sprint 2", dod: "Tiền xử lý dữ liệu (Feature Engineering). Huấn luyện thử nghiệm các mô hình khác nhau (Training)." },
      { name: "Sprint 3", dod: "Tối ưu siêu tham số (Hyperparameter tuning). Model đạt metrics kỳ vọng (Accuracy, F1, v.v.)." },
      { name: "Sprint 4", dod: "Đóng gói Model (API/Docker). Viết báo cáo nghiên cứu hoặc hướng dẫn sử dụng Model." },
    ]
  },
  SOFTWARE_TESTING: {
    description: "Kiểm thử Phần mềm (Manual & Automation)",
    sprints: [
      { name: "Sprint 1", dod: "Đọc hiểu tài liệu yêu cầu. Hoàn thiện Test Plan và khung Test Cases cơ bản." },
      { name: "Sprint 2", dod: "Viết xong 100% Test Cases. Bắt đầu chạy Manual Test và log bugs. Setup framework Automation." },
      { name: "Sprint 3", dod: "Hoàn thành Automation script cho các luồng chính (Happy path). Tỷ lệ Pass > 90%." },
      { name: "Sprint 4", dod: "Hoàn thiện báo cáo Test Report tổng hợp. Bàn giao bộ script Automation hoàn chỉnh." },
    ]
  }
};
