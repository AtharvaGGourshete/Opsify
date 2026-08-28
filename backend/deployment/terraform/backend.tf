terraform {
  backend "s3" {
    bucket       = "opsify-terraform-state-862205457196"
    key          = "test-app/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}