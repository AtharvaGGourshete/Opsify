variable "aws_region" {
  description = "AWS region where the application will be deployed"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Unique name of the application deployment"
  type        = string
}

variable "container_image" {
  description = "Docker image to deploy"
  type        = string
}

variable "container_port" {
  description = "Port exposed by the application container"
  type        = number
  default     = 7000
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "ecr_repository_arn" {
  description = "ARN of the ECR repository containing the application image"
  type        = string
}