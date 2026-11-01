import { mount, unmount } from 'svelte';
import BookingAdmin from './BookingAdmin.svelte';
import bookingStyles from './booking.css?inline';

const styleId = 'grav-booking-admin-styles';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = bookingStyles;
  document.head.append(style);
}

const tagName = window.__GRAV_PAGE_TAG || 'grav-booking-admin-page';
if (!customElements.get(tagName)) {
  class BookingAdminPage extends HTMLElement {
    private app: ReturnType<typeof mount> | undefined;

    connectedCallback(): void {
      if (this.app) return;
      this.style.display = 'block';
      this.app = mount(BookingAdmin, { target: this });
    }

    disconnectedCallback(): void {
      if (!this.app) return;
      unmount(this.app);
      this.app = undefined;
    }
  }

  customElements.define(tagName, BookingAdminPage);
}
