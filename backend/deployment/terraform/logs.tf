resource "aws_cloudwatch_log_group" "app" {
  name              = "/opsify/${var.project_name}"
  retention_in_days = 7

  tags = {
    Name    = "${var.project_name}-logs"
    Project = var.project_name
  }
}