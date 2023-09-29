---
permalink: /stories/
title: "Stories"
---

{% assign posts = site.posts | where_exp: 'item', 'item.categories contains "stories"' %}
{% for post in posts %}
  {% include archive-single.html %}
{% endfor %}
