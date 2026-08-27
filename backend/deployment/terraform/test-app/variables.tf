variable "aws_region" {
  description = "AWS region where the application will be deployed"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name of the application"
  type        = string
  default     = "opsify-test-app"
}

variable "container_image" {
  description = "Docker image to deploy"
  type        = string
}