# Credentials Folder

## The purpose of this folder was to store all credentials needed to log into the GatorMart server and databases. This is public because the server is no longer available after project conclusion.
------------------------------------------------------------------

1. Server URL: ec2-3-134-115-31.us-east-2.compute.amazonaws.com
2. SSH username: ubuntu
3. SSH key: in folder
4. Database Port: 3306
5. Database username: root
6. Database password: csc648
7. Database name: notebay

# Connecting to server from windows
1. Open Putty and make sure ssh is selected
2. In the Host Name section put username@serverURL (ubuntu@ec2-3-12...)
3. In the menu on the left, expand SSH and click on Auth
4. Browse the location of the key and select it
5. Clicking open will grant you access to the aws server

### Connecting to database
1. In the command line, sudo mysql -u root
2. If it asks for password: csc648
3. In mysql shell, show databases;

## Getting to website in browser
ec2-3-17-4-139.us-east-2.compute.amazonaws.com:3000 in address bar
