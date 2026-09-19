# Contributing shared sources

Add shared project material and the original files or public source code behind it. Keep independent personal studies and proposed designs outside this source collection.

For a new source:

1. Record who supplied it, its date/revision and any known limitations in the source provenance. Use “unknown” rather than inventing provenance. Organize explanatory documentation by topic or workstream.
2. Include the actual file, such as the PPTX, PDF, DOCX, native CAD project or source code. Preserve the original; label any text extraction or meeting summary as a derived representation. An external link can supplement the included material.
3. Add its path, origin, status, transformation, byte count and SHA-256 to [the manifest](sources/manifest.json), then link it from [the library](docs/library.md).
4. Check local links and file integrity:

```sh
python3 scripts/check_docs.py
git diff --check
```

The `sha256` describes the shared file; `source_sha256`, when present, describes the input before a documented adaptation. Do not imply that a source file proves a completed implementation or that a meeting statement is a current approved specification. Keep original ownership and applicable terms.

Use a pull request for collaborative updates. Describe the source, changes and verification. Report measurements separately from source documentation; a successful source check does not validate hardware.
