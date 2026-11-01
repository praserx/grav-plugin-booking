# Booking User Guide

This guide covers the first setup of the Grav Booking plugin and the routine
work of managing facilities and booking requests.

## Before you start

The site needs Grav 2.0+, PHP 8.3+ with PDO SQLite enabled, and the Grav API
plugin. Install and configure the Grav Email plugin if the public form will
accept requests: requesters must verify their email address before a request
can be completed.

The plugin stores its SQLite database at
`user/data/booking/booking.sqlite`. Make sure Grav can write to this path and
include it in your regular site backups.

## Configure a facility

Open **Admin Next → Booking → Facilities** and add a facility. Set its display
name, timezone, booking mode, approval mode, and availability. Configure rules
such as minimum and maximum booking duration, booking interval, advance notice,
and how far into the future visitors can book.

Choose a booking mode that matches the facility:

- **Whole facility**: one booking reserves the whole facility.
- **Resources**: visitors book a particular room or resource.
- **Both**: visitors may book the whole facility or an individual resource.

For resource-based booking, add one resource per line in the Resources tab.
Each line uses this format:

```text
id | name | description | allowed groups | instant approval groups | enabled
```

The ID should be unique within the facility. Group lists are comma-separated;
the final field can be `true` or `false`. Leave optional values empty when
they are not needed.

Use the Access tab to allow public requests, restrict requests to selected Grav
groups, or combine both. Instant approval can also be granted to selected
groups. These access rules are checked by the server when availability is read
and when a request is submitted.

## Publish a booking form

In **Admin Next → Pages**, create a page and select **Booking Form** as its
page type. Publish the page and link to it from your site navigation as needed.
The form displays the enabled facilities and resources that the visitor is
allowed to book.

The equivalent page header is:

```yaml
---
title: Book a facility
template: booking-form
visible: true
routable: true
---
```

Visitors choose an available date and time, enter their contact details, and
receive a six-digit email verification code. The code expires after 24 hours.
After verification, the request is either confirmed automatically or placed in
the pending queue according to the facility's approval setting.

## Manage bookings and availability

The **Bookings** tab provides a filterable table and calendar view. Open a
booking to review its details and history. Staff can create or edit bookings,
approve or reject pending requests, cancel active bookings, and remove records.

Use **Availability Blocks** to mark a facility or resource unavailable for a
specific date and time, or to add a recurring weekly block. The plugin checks
new requests against bookings, schedules, and availability blocks.

## Configure email messages

Configure a sender and mail transport in the Grav Email plugin. The booking
facility's Notifications tab lets you select administrator recipients and the
events they receive. Email verification is sent to every public requester.
Booking status messages follow the facility's notification settings; facility
administrator notifications can also be enabled or disabled per facility.

Email subjects and bodies can use placeholders such as
`{{ customer.name }}`, `{{ facility.name }}`, `{{ booking.start }}`,
`{{ booking.end }}`, and `{{ booking.id }}`. The verification message also
supports `{{ verification.code }}`. The editor in the facility settings lists
the available placeholders. Custom message bodies accept HTML, and the shared
email layout can use `{{ email.body }}` where the event message should appear.

## Import existing booking data

If the plugin detects legacy YAML or JSON booking data, the Booking workspace
shows an import preview with the available records and any validation issues.
Review the preview before importing. Keep a backup of the site data before
migrating existing bookings.
