---
title: Contact and directions
permalink: /patients/directions-contact/
description: Find Popp Chiropractic in Casper, open the map, call the practice or book a visit.
legacy_source: https://www.poppchiropractic.com/directions-contact
---

{% assign office = site.data.practice %}
{% capture address %}{{ office.street }}, {{ office.city }}, {{ office.state }} {{ office.zip }}{% endcapture %}
{% assign map_address = address | url_encode %}

## Visit the practice

{{ site.title }}  
{{ office.street }}  
{{ office.city }}, {{ office.state }} {{ office.zip }}

<div class="actions">
{% include booking.html %}
<a href="tel:{{ office.phone_href }}">Call {{ office.phone }}</a>
<a href="{{ office.facebook }}">Facebook</a>
</div>

## Map and directions

- [Open the office location on a map](https://www.google.com/maps/search/?api=1&amp;query={{ map_address }})
- [Get directions to the practice](https://www.google.com/maps/dir/?api=1&amp;destination={{ map_address }})

<iframe class="contact-map" title="Google Maps showing the Popp Chiropractic office in Casper" loading="lazy" referrerpolicy="no-referrer" src="https://www.google.com/maps?q={{ office.latitude }}%2C{{ office.longitude }}&amp;output=embed"></iframe>

## General questions

{% include visitor-form.html kind="contact" %}
