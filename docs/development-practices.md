# Development Practices

## Line Endings Policy

To avoid cross-platform churn and Git warnings, this repository uses a consistent line endings policy:

1. Repository text files are stored as LF.
2. Windows-native scripts (`.bat`, `.cmd`, `.ps1`) use CRLF in the working tree.
3. Binary files are marked as binary and are not line-ending normalized.

This policy is enforced by:

- `.gitattributes` for Git normalization behavior.
- `.editorconfig` for editor save behavior.

## One-Time Normalization

After line-ending policy changes, run:

```bash
git add --renormalize .
```

Then review changes with `git status` before committing.
