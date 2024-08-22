# MarketplacePlatform
## Web Frontend with CodePipeline (GitHub -> CodeBuild -> CodeDeploy -> S3) and CloudFormation

### Steps to deploy the stack:

1. Fork the repository to your GitHub account. Create a connection for the repository in CodePipeline. Follow the steps in the [documentation](https://console.aws.amazon.com/codesuite/settings/connections) to create a connection. Copy the connection ARN for the next step.

2. Clone the repository to your local machine. Navigate into the repository root directory. Run the following command to create a CI/CD pipeline using the AWS CLI and AWS CloudFormation:
    ```
    aws cloudformation create-stack --stack-name <stack-name> --template-body file://codepipeline-cicd.yml --capabilities CAPABILITY_NAMED_IAM --profile default --parameters ParameterKey=GithubBranch,ParameterValue='<github-branch-name>' ParameterKey=GithubRepo,ParameterValue='<github-account>/<github-repo>' ParameterKey=GithubConnectionArn,ParameterValue='<connection-arn>' ParameterKey=BackEndHost,ParameterValue='<backend-host>'
    ```

    Replace the following placeholders:
    - `<stack-name>`: The name of the CloudFormation stack.
    - `<github-branch-name>`: The name of the branch in the GitHub repository. (frontend-dev-cicd)
    - `<github-account>`: Your GitHub account name.
    - `<github-repo>`: The name of the GitHub repository.
    - `<connection-arn>`: The ARN of the GitHub connection.
    - `<backend-host>`: The hostname of the backend service.

3. Navigate to the AWS Management Console. Go to the CloudFormation service. Select the stack that you created in the previous step. Click on the "Outputs" tab to get the URL of the frontend application.
