---
title: This is my first post.
description: This is a post on My Blog about how It is started.
date: 2021-06-01
tags:
    - post
layout: layouts/post.njk
---

# Hello world

There it is, yet another blog. I need something to fill my domain, and I can use this platform to train my language
skills. I've heard many goods about 11ty, and there it is. 11ty is my static page generator. So far I like it. For now, I'm using
ready template [eleventy-high-performance-blog](https://www.industrialempathy.com/posts/eleventy-high-performance-blog/). I've done few
changes, adjust codebase to my like, but overall a lot of stuff here, just have a sense. I'll use it as a base.

Now it is time to set up CI/CD and everything is ready to go. I've decided to do deploy on push and only buid and test on
PR. This was easier than I was think, dough yaml format was not gain my heart. Only `_site` folder is deployed to
the server, what is nice and neat solution. I still have 3 tests failing, but it's coused by missing content. In future, they will be enabled.
