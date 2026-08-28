output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = [
    aws_subnet.public_a.id,
    aws_subnet.public_b.id
  ]
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  value = aws_ecs_cluster.main.arn
}

output "ecs_task_execution_role_arn" {
  value = aws_iam_role.ecs_task_execution.arn
}

output "cloudwatch_log_group_name" {
  value = aws_cloudwatch_log_group.app.name
}

output "ecs_task_definition_arn" {
  value = aws_ecs_task_definition.app.arn
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "load_balancer_dns_name" {
  value = aws_lb.app.dns_name
}

output "ecr_repository_url" {
  description = "ECR repository URL for the application"
  value       = aws_ecr_repository.app.repository_url
}