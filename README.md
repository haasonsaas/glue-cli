# glue

The Zapier for your CLI - Create powerful, declarative workflows that connect your local development environment with cloud services and APIs.

## Installation

```bash
npm install -g glue-cli
```

## Quick Start

1. Initialize a new workflow file:
```bash
glue init
```

2. Create your first workflow in `glue.yaml`:
```yaml
when: deploy
  steps:
    - name: "Run tests"
      run: "npm test"
    
    - name: "Notify team"
      adapter: slack
      action: notify
      options:
        channel: "#deployments"
        message: "Deployment completed successfully"
```

3. Run your workflow:
```bash
glue run deploy
```

## Features

- **Declarative Workflows**: Define workflows in simple YAML files
- **Built-in Adapters**: Integrate with GitHub, Slack, GCP, Notion, Linear, and more
- **Local Command Execution**: Run any local command or script as part of your workflow
- **Secure Authentication**: Credentials stored securely in your system keychain
- **Audit Trail**: Complete history of all workflow executions

## Commands

- `glue init` - Initialize a new glue.yaml file
- `glue run <workflow>` - Run a specific workflow
- `glue list` - List all available workflows
- `glue history` - Show workflow execution history
- `glue auth <adapter>` - Authenticate with a specific adapter

## License

MIT