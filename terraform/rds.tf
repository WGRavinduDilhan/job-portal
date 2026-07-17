data "aws_db_instance" "mysql" {
  db_instance_identifier = "jobportal-db"
}

output "rds_endpoint" {
  value = data.aws_db_instance.mysql.endpoint
}
