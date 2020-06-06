---
permalink: /writing/
title: "Writing"
---

I like to write sometimes.  
<a href="https://flubbergasted.tumblr.com/">Daily prompts</a>

{% assign posts = site.posts | where: 'category', 'writing' %}
{% for post in posts %}
  {% include archive-single.html %}
{% endfor %}
