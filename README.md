# Grav Booking Plugin

A booking and availability plugin for [Grav CMS](https://getgrav.org/). Manage
facilities, rooms or other resources, schedules, booking requests, and
availability blocks from Grav Admin Next, then publish a booking form as a
regular Grav page.

## Features

- Manage multiple facilities, resources, schedules, booking rules, and approval
  settings.
- Publish a public booking form with live availability checks and email
  verification for booking requests.
- Review bookings in a table or calendar, and create, edit, approve, reject, or
  cancel bookings in Admin Next.
- Add dated and recurring availability blocks.
- Restrict booking access by Grav user group and configure email notifications
  per facility.
- Store booking data in SQLite and import supported legacy YAML and JSON data
  from the Admin Next workspace.

## Requirements

- Grav CMS 2.0 or newer.
- PHP 8.3 or newer with PDO and the `pdo_sqlite` extension.
- The Grav API plugin for the Admin Next workspace and plugin API routes.
- The Grav Email plugin with a working mail transport for public email
  verification and booking messages.

## Installation

Install the Grav API and Email plugins if they are not already installed:

```sh
bin/gpm install api
bin/gpm install email
```

From the root of your Grav site, clone this repository into the plugin
directory:

```sh
git clone https://github.com/praserx/grav-plugin-booking.git user/plugins/booking
bin/grav clear-cache
```

For a ZIP installation, place the plugin files in `user/plugins/booking/` so
that `user/plugins/booking/booking.php` exists, then clear Grav's cache. When
the plugin is available in the Grav Package Manager, it can also be installed
with `bin/gpm install booking`.

## Quick start

1. Configure the Grav Email plugin with a sender address and a working mail
   transport.
2. In Admin Next, open **Booking** and add a facility. Set its timezone,
   booking mode, approval policy, availability, and booking rules. Add resources
   if the facility is bookable by room or resource.
3. In **Admin Next → Pages**, create a **Booking Form** page and choose its
   facility in the page's Booking tab. Create one page per facility; visitors
   will see that facility's calendar and form without choosing a facility.
4. Submit a test request through the page and verify the email address with the
   six-digit code sent to the requester.

Grant staff the `booking.admin` permission to let them manage facilities and
bookings. The Admin Next interface is available to users who have this
permission.

For detailed setup and operating instructions, see the
[Booking user guide](docs/USER-GUIDE.md).

## Support

Report issues and request features in the
[GitHub issue tracker](https://github.com/praserx/grav-plugin-booking/issues).

## Data and upgrades

Booking data, including contact details, is stored in
`user/data/booking/booking.sqlite`. Ensure this directory is writable by Grav
and include it in the site's backups.

When upgrading an installation that has booking data in the earlier YAML or
JSON format, open **Admin Next → Booking** and review the legacy data import
preview before importing it.

## Development

The Admin Next interface source is under `src/admin/`; Grav serves the built
bundle from `admin-next/pages/booking.js`. Rebuild it with Node.js:

```sh
npm ci
npm run check:admin
npm run build:admin
```

PHP unit tests are defined in Composer:

```sh
composer install
composer test
```

## License

This plugin is released under the [MIT License](LICENSE).
