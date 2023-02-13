# Kubeconform
Run [kubeconform](https://github.com/yannh/kubeconform) in GitHub Actions with ease (without sending your GH_TOKEN's to Docker).

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
  test:
    name: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: check manifests
        uses: hermanbanken/kubeconform-action@v1
        with:
          options: ["-output", "json", "fixtures/invalid.yaml"]
```

# Inspiration
Inspired by [golangci/golangci-lint-action](https://github.com/golangci/golangci-lint-action).