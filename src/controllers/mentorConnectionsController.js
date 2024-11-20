const MentorConnection = require("../models/mentorConnections");

// Controller cho các yêu cầu kết nối của mentee
class MentorConnectionController {
  // Lấy tất cả yêu cầu kết nối của mentee
  static async getMenteeRequests(req, res) {
    const menteeId = req.user.id; // Lấy mentee_id từ JWT hoặc session
    try {
      const requests = await MentorConnection.getMenteeRequests(menteeId);
      res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi máy chủ");
    }
  }

  // Hủy yêu cầu kết nối của mentee
  static async cancelRequest(req, res) {
    const connectionId = req.params.connectionId;
    try {
      const success = await MentorConnection.cancelRequest(connectionId);
      if (success) {
        res.status(200).send("Yêu cầu đã bị hủy");
      } else {
        res.status(404).send("Không tìm thấy yêu cầu");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi máy chủ");
    }
  }

  // Lấy tất cả yêu cầu kết nối của mentor
  static async getMentorRequests(req, res) {
    const mentorId = req.user.id; // Lấy mentor_id từ JWT hoặc session
    try {
      const requests = await MentorConnection.getMentorRequests(mentorId);
      res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi máy chủ");
    }
  }

  // Chấp nhận hoặc từ chối yêu cầu kết nối của mentor
  static async updateRequestStatus(req, res) {
    const connectionId = req.params.connectionId;
    const { action } = req.body; // action có thể là 'approve' hoặc 'reject'
    let status;

    if (action === "approve") {
      status = "Chờ BĐH"; // Trạng thái chờ admin duyệt
    } else if (action === "reject") {
      status = "Từ chối bởi Mentor";
    } else if (action === "cancel") {
      status = "Mentee hủy yêu cầu";
    } else if (action === "admin_approve") {
      status = "Đã kết nối";
    } else if (action === "admin_reject") {
      status = "Từ chối bởi BĐH";
    } else {
      return res.status(400).send("Invalid action");
    }

    try {
      const success = await MentorConnection.updateRequestStatus(
        connectionId,
        status
      );
      if (success) {
        res.status(200).send("Request updated");
      } else {
        res.status(404).send("Request not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi máy chủ");
    }
  }

  // Lấy tất cả yêu cầu mà mentor đã approve cho admin duyệt
  static async getApprovedRequests(req, res) {
    try {
      const requests = await MentorConnection.getApprovedRequests();
      res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi máy chủ");
    }
  }

  // Admin duyệt kết nối và hủy các yêu cầu khác
  static async approveConnection(req, res) {
    const { connectionId, mentorId, menteeId } = req.body;
    try {
      const success = await MentorConnection.approveConnection(
        connectionId,
        mentorId,
        menteeId
      );
      if (success) {
        res.status(200).send("Connection approved");
      } else {
        res.status(404).send("Connection not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi máy chủ");
    }
  }

  // Phương thức mới để lấy yêu cầu và kiểm tra kết nối
  static async getMenteeStatus(req, res) {
    const menteeId = req.user.torteeId; // Lấy mentee_id từ JWT token

    try {
      // Lấy thông tin yêu cầu kết nối của mentee
      const requests = await MentorConnection.getMenteeRequests(menteeId);

      // Kiểm tra nếu có kết nối với mentor
      const activeConnection = requests.find(
        (request) => request.status === "Đã kết nối"
      );

      if (activeConnection) {
        // Nếu có kết nối, trả về thông tin của mentor
        const mentor = await MentorConnection.getMentorInfo(
          activeConnection.mentor_id
        );
        return res.status(200).json({
          connectionStatus: "connected",
          mentor: mentor,
        });
      } else {
        // Nếu không có kết nối, trả về danh sách các yêu cầu
        return res.status(200).json({
          connectionStatus: "not_connected",
          requests: requests,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi máy chủ");
    }
  }

  // Phương thức lấy trạng thái kết nối và yêu cầu của Mentor
  static async getMentorStatus(req, res) {
    const mentorId = req.user.torteeId; // Lấy mentor_id từ JWT token

    try {
      // Lấy yêu cầu kết nối của Mentor
      const requests = await MentorConnection.getMentorRequests(mentorId);

      // Kiểm tra nếu có kết nối với mentee
      const activeConnection = requests.find(
        (request) => request.status === "Đã kết nối"
      );

      if (activeConnection) {
        // Nếu có kết nối, trả về thông tin của mentee
        const mentee = await MentorConnection.getMenteeInfo(
          activeConnection.mentee_id
        );
        return res.status(200).json({
          connectionStatus: "connected",
          mentee: mentee,
        });
      } else {
        // Nếu không có kết nối, trả về danh sách các yêu cầu kết nối
        return res.status(200).json({
          connectionStatus: "not_connected",
          requests: requests,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi máy chủ");
    }
  }
}

module.exports = MentorConnectionController;
