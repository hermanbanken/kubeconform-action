# How to use
Add .github/workflows/kubeconform.yml with the following contents:

```yaml
name: kubeconform
on:
  push:
    tags:
      - v*
    branches:
      - master
      - main
  pull_request:
permissions:
  contents: read
jobs:
  golangci:
    name: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: check manifests
        uses: hermanbanken/kubeconform-action@v1
        with:
          options: ["-output", "json", "fixtures/invalid.yaml"]
```

We recommend running this action in a job separate from other jobs (go test, etc) because different jobs run in parallel.