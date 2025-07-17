<?php
$host = "localhost";
$user = "root";
$password = "";
$db = "techshell";

$conn = new mysqli($host, $user, $password, $db);
if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["status" => "error", "message" => "Database connection failed"]);
  exit;
}

date_default_timezone_set('Asia/Kolkata');

$data = json_decode(file_get_contents("php://input"));
if (!isset($data->name, $data->login, $data->logout, $data->total, $data->status)) {
  http_response_code(400);
  echo json_encode(["status" => "error", "message" => "Missing required fields"]);
  exit;
}

$name = $conn->real_escape_string($data->name);
$login = $conn->real_escape_string($data->login);
$logout = $conn->real_escape_string($data->logout);
$total = $conn->real_escape_string($data->total);
$status = $conn->real_escape_string($data->status);
$date = date('Y-m-d');

$stmt = $conn->prepare("INSERT INTO attendance (name, login_time, logout_time, total_hours, status, date) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $name, $login, $logout, $total, $status, $date);

if ($stmt->execute()) {
  echo json_encode(["status" => "success", "message" => "Attendance saved", "id" => $stmt->insert_id]);
} else {
  http_response_code(500);
  echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
