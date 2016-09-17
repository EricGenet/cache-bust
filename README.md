# cache-bust

Append content hashes to files, and update references to these files.

Example:
```
$ tree .
img
│   ├── bar.jpg
│   └── foo.png
└── index.html

$ cat index.html
<img src='img/foo.png'>
<img src='img/bar.jpg'>

$ cache-bust --referencing=index.html --referenced='img/**/*'

$ tree .
img
│   ├── bar-1709e1f.jpg
│   └── foo-4358d97.png
└── index.html

$ cat index.html
<img src='img/foo-4358d97.png'>
<img src='img/bar-1709e1f.jpg'>
```
