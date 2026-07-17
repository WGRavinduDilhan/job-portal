data "aws_instance" "k3s_node" {
  instance_id = "i-0b8dd8dfbe558b6d5"
}

output "k3s_public_ip" {
  value = data.aws_instance.k3s_node.public_ip
}

output "app_url" {
  value = "http://jobs-portal.duckdns.org"
}
