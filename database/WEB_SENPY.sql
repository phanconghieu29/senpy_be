USE master
GO

--ALTER DATABASE WEB_SENPY SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

--DROP DATABASE WEB_SENPY
--GO


CREATE DATABASE WEB_SENPY
GO

USE WEB_SENPY
GO

CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    gender NVARCHAR(10),
    email NVARCHAR(100) UNIQUE NOT NULL,
    phone NVARCHAR(15) NOT NULL,
    facebook_link NVARCHAR(255),
    role NVARCHAR(10) NOT NULL,
	avatar NVARCHAR(255),
    password NVARCHAR(255) NOT NULL,
	status NVARCHAR(15) NOT NULL,
	created_at DATETIME DEFAULT GETDATE()
)
GO

CREATE TABLE Mentor (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    expertise NVARCHAR(MAX),
    strengths NTEXT,
    weaknesses NTEXT,
    goals NTEXT,
    mentoring_expectations NTEXT,
    reason_for_mentoring NTEXT
)
GO

CREATE TABLE Mentee (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    year_in_school NVARCHAR(10),
    major NVARCHAR(100),
    strengths NTEXT,
    weaknesses NTEXT,
    goals NTEXT,
    mentoring_expectations NTEXT
)
GO

---- Tạo bảng InterviewNotifications: Quản lý thông báo lịch phỏng vấn cho Mentee
--CREATE TABLE InterviewNotifications (
--    notification_id INT PRIMARY KEY IDENTITY(1,1),  -- ID tự động tăng
--    mentee_id INT NOT NULL,
--    time DATETIME,                                  -- Thời gian phỏng vấn
--    location NVARCHAR(255),                         -- Địa điểm phỏng vấn
--    requirements NTEXT,                             -- Yêu cầu liên quan
--    status NVARCHAR(20),                            -- Trạng thái: 'sent', 'updated', 'error'
--    FOREIGN KEY (mentee_id) REFERENCES Mentee(id)
--)
--GO

-- Tạo bảng Schedules: Quản lý lịch cố vấn giữa Mentor và Mentee
CREATE TABLE Schedules (
    schedule_id INT PRIMARY KEY IDENTITY(1,1),      -- ID tự động tăng
    mentor_id INT NOT NULL,
    mentee_id INT NOT NULL,
    scheduled_time DATETIME,                        -- Thời gian hẹn
    status NVARCHAR(20),                            -- Trạng thái: 'scheduled', 'cancelled'
	title NVARCHAR(50),
	location NVARCHAR(100),
    reason_for_cancel NTEXT,                        -- Lý do hủy (nếu có)
    FOREIGN KEY (mentor_id) REFERENCES Mentor(id),
    FOREIGN KEY (mentee_id) REFERENCES Mentee(id)
)
GO

-- Tạo bảng SessionSummaries: Lưu báo cáo và tổng kết buổi cố vấn của Mentee
CREATE TABLE SessionSummaries (
    summary_id INT PRIMARY KEY IDENTITY(1,1),           -- ID bài báo cáo tự động tăng
    schedule_id INT NOT NULL,                           -- ID lịch, tham chiếu đến bảng Schedules để lấy ngày gặp
    cross_mentor NVARCHAR(255),                         -- Tên Cross Mentor
    meeting_number INT,                                 -- Lần gặp
    report_date DATETIME DEFAULT GETDATE(),             -- Ngày viết báo cáo, tự động lấy
    achieved_results NTEXT,                             -- Kết quả đạt được
    current_issues NTEXT,                               -- Vấn đề lần này
    mentor_guidance NTEXT,                              -- Hướng dẫn của Mentor
    next_steps_and_commitments NTEXT,                   -- Hành động sắp tới và cam kết thực hiện
    image NVARCHAR(255),                                -- Hình ảnh (nếu có)
    status NVARCHAR(20) ,             -- Trạng thái: 'pending' (chờ duyệt), 'posted' (đã duyệt)
    FOREIGN KEY (schedule_id) REFERENCES Schedules(schedule_id)
)
GO

-- Tạo bảng Feedback: Lưu trữ đánh giá về quá trình cố vấn của Mentor và Mentee
CREATE TABLE Feedback (
    feedback_id INT PRIMARY KEY IDENTITY(1,1),      -- ID tự động tăng
    mentor_id INT NOT NULL,
    mentee_id INT NOT NULL,
    quality_score INT,                              -- Đánh giá chất lượng
    collaboration_score INT,                        -- Đánh giá mức độ hợp tác
    effectiveness_score INT,                        -- Đánh giá hiệu quả
    comments NTEXT,                                 -- Phản hồi chi tiết
    feedback_date DATETIME DEFAULT GETDATE(),       -- Ngày đánh giá
    FOREIGN KEY (mentor_id) REFERENCES Mentor(id),
    FOREIGN KEY (mentee_id) REFERENCES Mentee(id)
)
GO

---- Tạo bảng AdminActions: Theo dõi các hành động quản lý của Admin
--CREATE TABLE AdminActions (
--    action_id INT PRIMARY KEY IDENTITY(1,1),        -- ID tự động tăng
--    admin_id INT NOT NULL,
--    action_type NVARCHAR(50),                       -- Loại hành động ('approve', 'reject', 'manage_account')
--    target_user_id INT,                             -- ID người dùng liên quan
--    timestamp DATETIME DEFAULT GETDATE(),           -- Thời gian thực hiện hành động
--    notes NTEXT,                                    -- Ghi chú về hành động
--    FOREIGN KEY (admin_id) REFERENCES Users(user_id),
--    FOREIGN KEY (target_user_id) REFERENCES Users(user_id)
--)
--GO

---- Tạo bảng LoginHistory: Theo dõi lịch sử đăng nhập của người dùng
--CREATE TABLE LoginHistory (
--    login_id INT PRIMARY KEY IDENTITY(1,1),         -- ID tự động tăng
--    user_id INT NOT NULL,
--    login_time DATETIME DEFAULT GETDATE(),          -- Thời gian đăng nhập
--    success BIT,                                    -- Kết quả đăng nhập (thành công/thất bại)
--    FOREIGN KEY (user_id) REFERENCES Users(user_id)
--)
--GO

-- Tạo bảng MentorConnections: Lưu trữ yêu cầu kết nối giữa Mentor và Mentee
CREATE TABLE MentorConnections (
    connection_id INT PRIMARY KEY IDENTITY(1,1),    -- ID tự động tăng
    mentee_id INT NOT NULL,
    mentor_id INT NOT NULL,
	introduction NVARCHAR(255),
    status NVARCHAR(20),                            -- Trạng thái: 'pending', 'approved', 'rejected'
    request_date DATETIME DEFAULT GETDATE(),        -- Ngày gửi yêu cầu
    approval_date DATETIME,                         -- Ngày phê duyệt hoặc từ chối
    FOREIGN KEY (mentee_id) REFERENCES Mentee(id),
    FOREIGN KEY (mentor_id) REFERENCES Mentor(id)
)
GO

-- Tạo bảng News: Lưu trữ thông tin tin tức cập nhật hàng ngày do Admin đăng
CREATE TABLE News (
    news_id INT PRIMARY KEY IDENTITY(1,1),          -- ID tự động tăng
    title NVARCHAR(255) NOT NULL,                   -- Tiêu đề tin tức
    content NTEXT NOT NULL,                         -- Nội dung tin tức
    post_date DATETIME DEFAULT GETDATE(),           -- Ngày đăng
    author_id INT NOT NULL,                         -- ID tác giả (Admin)
	image_url VARCHAR(255),
    FOREIGN KEY (author_id) REFERENCES Users(user_id)
)
GO


---- INSERT 2 MENTORS
--DECLARE @hashedPassword NVARCHAR(255) = '$2b$10$EL7caAv5stCTHRggQzH5V.E3jS2KGcpTJ8YZHBITLyR4NdMZb0yX2';

---- Tạo biến TABLE tạm để lưu user_id
--DECLARE @InsertedUsers TABLE (user_id INT);

---- Insert 20 users và mentors
--DECLARE @Counter INT = 1;

--WHILE @Counter <= 20
--BEGIN
--    -- Tạo dữ liệu ngẫu nhiên cho từng mentor
--    DECLARE @Name NVARCHAR(100) = CONCAT('Mentor ', @Counter);
--    DECLARE @Gender NVARCHAR(10) = CASE WHEN @Counter % 2 = 0 THEN N'Nam' ELSE N'Nữ' END;
--    DECLARE @Email NVARCHAR(100) = CONCAT('mentor', @Counter, '@example.com');
--    DECLARE @Phone NVARCHAR(15) = CONCAT('090', RIGHT('0000' + CAST(@Counter AS VARCHAR), 4));
--    DECLARE @FacebookLink NVARCHAR(255) = CONCAT('https://facebook.com/mentor', @Counter);
--    DECLARE @Expertise NVARCHAR(MAX) = CONCAT('Expertise ', @Counter);
--    DECLARE @Strengths NVARCHAR(MAX) = CONCAT('Strengths of mentor ', @Counter);
--    DECLARE @Weaknesses NVARCHAR(MAX) = CONCAT('Weaknesses of mentor ', @Counter);
--    DECLARE @Goals NVARCHAR(MAX) = CONCAT('Goals of mentor ', @Counter);
--    DECLARE @MentoringExpectations NVARCHAR(MAX) = CONCAT('Expectations from mentoring ', @Counter);
--    DECLARE @ReasonForMentoring NVARCHAR(MAX) = CONCAT('Reason for mentoring ', @Counter);

--    -- Chèn vào bảng Users và lưu user_id vào bảng tạm
--    INSERT INTO Users (name, gender, email, phone, facebook_link, role, avatar, password, status)
--    OUTPUT inserted.user_id INTO @InsertedUsers
--    VALUES (@Name, @Gender, @Email, @Phone, @FacebookLink, 'mentor', NULL, @hashedPassword, N'Đã kích hoạt');

--    -- Lấy user_id vừa được chèn vào từ bảng tạm
--    DECLARE @UserID INT;
--    SELECT TOP 1 @UserID = user_id FROM @InsertedUsers ORDER BY user_id DESC; -- Lấy user_id mới nhất

--    -- Chèn vào bảng Mentor sử dụng user_id vừa tạo
--    INSERT INTO Mentor (user_id, expertise, strengths, weaknesses, goals, mentoring_expectations, reason_for_mentoring)
--    VALUES (@UserID, @Expertise, @Strengths, @Weaknesses, @Goals, @MentoringExpectations, @ReasonForMentoring);

--    -- Tăng biến đếm
--    SET @Counter = @Counter + 1;
--END;
--GO

-- Khai báo danh sách tên đầy đủ và chuyên môn
DECLARE @Names NVARCHAR(MAX) = N'Nguyễn Văn A, Trần Thị B, Lê Văn C, Phạm Thị D, Hoàng Văn E, Vũ Thị F, Phan Văn G, Đỗ Thị H, Hồ Văn I, Bùi Thị K, Trương Văn L, Lý Thị M, Võ Văn N, Ngô Thị O, Dương Văn P, Lâm Thị Q, Nguyễn Văn R, Trần Thị S, Lê Văn T, Phạm Thị U';
DECLARE @Expertises NVARCHAR(MAX) = N'Đảm bảo chất lượng và an toàn thực phẩm,Công nghệ chế biến thuỷ sản,Kế toán,Tài chính - Ngân hàng,Quản trị kinh doanh,Kinh doanh quốc tế,Luật kinh tế,Khoa học dinh dưỡng và ẩm thực,Khoa học chế biến món ăn,Quản trị dịch vụ du lịch và lữ hành,Quản trị nhà hàng và dịch vụ ăn uống,Quản trị khách sạn,Ngôn ngữ Anh,Ngôn ngữ Trung Quốc,Công nghệ thông tin,An toàn thông tin,Công nghệ chế tạo máy,Công nghệ kỹ thuật điện,điện tử,Công nghệ kỹ thuật cơ điện tử,Công nghệ kỹ thuật điều khiển và tự động hóa';

-- Tách chuỗi tên và chuyên môn thành bảng tạm
DECLARE @NameList TABLE (id INT IDENTITY(1,1), name NVARCHAR(100));
DECLARE @ExpertiseList TABLE (id INT IDENTITY(1,1), expertise NVARCHAR(MAX));

-- Sử dụng N'' để đảm bảo chuỗi dữ liệu Unicode
INSERT INTO @NameList (name)
SELECT value FROM STRING_SPLIT(@Names, ',');

INSERT INTO @ExpertiseList (expertise)
SELECT value FROM STRING_SPLIT(@Expertises, ',');

-- Khởi tạo các biến
DECLARE @Counter INT = 1;
DECLARE @TotalMentors INT = (SELECT COUNT(*) FROM @NameList);
DECLARE @hashedPassword NVARCHAR(255) = N'$2b$10$EL7caAv5stCTHRggQzH5V.E3jS2KGcpTJ8YZHBITLyR4NdMZb0yX2'; -- Dùng N để đảm bảo mật khẩu được xử lý đúng

-- Tạo biến TABLE tạm để lưu user_id
DECLARE @InsertedUsers TABLE (user_id INT);

-- Vòng lặp tạo mentor
WHILE @Counter <= @TotalMentors
BEGIN
    -- Lấy tên và chuyên môn từ danh sách
    DECLARE @Name NVARCHAR(100);
    DECLARE @Expertise NVARCHAR(MAX);
    SELECT @Name = name FROM @NameList WHERE id = @Counter;
    SELECT @Expertise = expertise FROM @ExpertiseList WHERE id = @Counter;

    -- Tạo các thông tin còn lại
    DECLARE @Gender NVARCHAR(10) = CASE WHEN @Counter % 2 = 0 THEN N'Nam' ELSE N'Nữ' END;
    DECLARE @Email NVARCHAR(100) = CONCAT('mentor', @Counter, '@example.com');
    DECLARE @Phone NVARCHAR(15) = CONCAT('090', RIGHT('0000' + CAST(@Counter AS VARCHAR), 4));
    DECLARE @FacebookLink NVARCHAR(255) = CONCAT('https://facebook.com/mentor', @Counter);
    DECLARE @Strengths NVARCHAR(MAX) = CONCAT('Strengths of ', @Name);
    DECLARE @Weaknesses NVARCHAR(MAX) = CONCAT('Weaknesses of ', @Name);
    DECLARE @Goals NVARCHAR(MAX) = CONCAT('Goals of ', @Name);
    DECLARE @MentoringExpectations NVARCHAR(MAX) = CONCAT('Expectations from mentoring ', @Name);
    DECLARE @ReasonForMentoring NVARCHAR(MAX) = CONCAT('Reason for mentoring ', @Name);

    -- Chèn vào bảng Users và lưu user_id vào bảng tạm
    INSERT INTO Users (name, gender, email, phone, facebook_link, role, avatar, password, status)
    OUTPUT inserted.user_id INTO @InsertedUsers
    VALUES (@Name, @Gender, @Email, @Phone, @FacebookLink, 'mentor', NULL, @hashedPassword, N'Đã kích hoạt');

    -- Lấy user_id vừa được chèn vào từ bảng tạm
    DECLARE @UserID INT;
    SELECT TOP 1 @UserID = user_id FROM @InsertedUsers ORDER BY user_id DESC; -- Lấy user_id mới nhất

    -- Chèn vào bảng Mentor sử dụng user_id vừa tạo
    INSERT INTO Mentor (user_id, expertise, strengths, weaknesses, goals, mentoring_expectations, reason_for_mentoring)
    VALUES (@UserID, @Expertise, @Strengths, @Weaknesses, @Goals, @MentoringExpectations, @ReasonForMentoring);

    -- Tăng biến đếm
    SET @Counter = @Counter + 1;
END;
GO


-- Thêm 1 admin
INSERT INTO Users (name, gender, email, phone, facebook_link, role, avatar, password, status)
VALUES 
('Admin User', N'Nam', 'admin@example.com', '0909999999', NULL, 'admin', NULL, '$2b$10$EL7caAv5stCTHRggQzH5V.E3jS2KGcpTJ8YZHBITLyR4NdMZb0yX2', N'Đã kích hoạt');

-- Tạo hàm để thêm 5 mentee
DECLARE @hashedPassword NVARCHAR(255) = N'$2b$10$EL7caAv5stCTHRggQzH5V.E3jS2KGcpTJ8YZHBITLyR4NdMZb0yX2'; -- Mật khẩu mã hóa

-- Tạo bảng tạm để lưu user_id
DECLARE @InsertedUsers TABLE (user_id INT);

-- Insert 5 mentees vào bảng Users và bảng Mentee
DECLARE @Counter INT = 1;
WHILE @Counter <= 5
BEGIN
    -- Tạo dữ liệu giả lập cho mỗi mentee
    DECLARE @Name NVARCHAR(100) = CONCAT('Mentee ', CHAR(64 + @Counter)); -- Mentee A, Mentee B...
    DECLARE @Gender NVARCHAR(10) = CASE WHEN @Counter % 2 = 0 THEN N'Nữ' ELSE N'Nam' END;
    DECLARE @Email NVARCHAR(100) = CONCAT('mentee', @Counter, '@example.com');
    DECLARE @Phone NVARCHAR(15) = CONCAT('091000000', @Counter);
    DECLARE @FacebookLink NVARCHAR(255) = CONCAT('https://facebook.com/mentee', @Counter);
    DECLARE @Status NVARCHAR(50) = N'Đã kích hoạt';  -- Trạng thái mặc định

    -- Chèn vào bảng Users và lưu user_id vào bảng tạm
    INSERT INTO Users (name, gender, email, phone, facebook_link, role, avatar, password, status)
    OUTPUT inserted.user_id INTO @InsertedUsers
    VALUES (@Name, @Gender, @Email, @Phone, @FacebookLink, 'mentee', NULL, @hashedPassword, @Status);

    -- Lấy user_id vừa được chèn vào từ bảng tạm
    DECLARE @UserID INT;
    SELECT TOP 1 @UserID = user_id FROM @InsertedUsers ORDER BY user_id DESC; -- Lấy user_id mới nhất

    -- Chèn vào bảng Mentee sử dụng user_id vừa tạo
    INSERT INTO Mentee (user_id) VALUES (@UserID);

    -- Tăng biến đếm
    SET @Counter = @Counter + 1;
END;
GO


select * from users
select * from mentor
select * from mentee
--select * from MentorConnections
--select * from schedules
--select * from SessionSummaries
--select * from Feedback