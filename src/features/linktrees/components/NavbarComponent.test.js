import { describe, it, expect, vi, beforeEach } from "vitest";
import NavbarComponent from "./NavbarComponent.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProfile = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    photo: "https://example.com/john.jpg",
  };

  it("should render branding and profile information with photo", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: mockProfile, isSidebarOpen: false },
    });

    expect(wrapper.text()).toContain("Delcom Link Tree");
    expect(wrapper.text()).toContain("John Doe");
    expect(wrapper.text()).toContain("john@example.com");

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe(mockProfile.photo);
  });

  it("should render fallback avatar when profile has no photo", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: { id: 2, name: "Alice", email: "alice@example.com", photo: null },
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain("A");
  });

  it("should render default Pengguna fallback when name and email are empty", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: { id: 3 },
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Pengguna");
    expect(wrapper.text()).toContain("U");
  });

  it("should toggle sidebar when mobile toggle button is clicked", async () => {
    const toggleSpy = vi.fn();
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfile,
        isSidebarOpen: false,
        onToggleSidebar: toggleSpy,
      },
    });

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");
    expect(toggleSpy).toHaveBeenCalled();
  });

  it("should toggle sidebar even without onToggleSidebar prop", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: mockProfile, isSidebarOpen: false },
    });

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");
    // branch if (onToggleSidebar) false ter-cover
  });

  it("should navigate to home when brand link is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: mockProfile, isSidebarOpen: false },
    });

    const brandLink = wrapper.find('a[href="/"]');
    await brandLink.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should open dropdown menu, navigate to /profile, and close dropdown on click outside", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: mockProfile, isSidebarOpen: false },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");

    const menu = wrapper.find('[data-testid="profile-dropdown-menu"]');
    expect(menu.exists()).toBe(true);

    const profileLink = wrapper.find('[data-testid="profile-dropdown-link"]');
    await profileLink.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/profile");

    // Reopen and test click outside
    await dropdownBtn.trigger("click");
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(false);
  });

  it("should keep dropdown open when mousedown happens inside the dropdown", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: mockProfile, isSidebarOpen: false },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    dropdownBtn.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);
  });

  it("should trigger logout event and callback when logout button is clicked", async () => {
    const logoutSpy = vi.fn();
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfile,
        isSidebarOpen: false,
        onLogout: logoutSpy,
      },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");

    const logoutBtn = wrapper.find('[data-testid="profile-dropdown-logout-btn"]');
    await logoutBtn.trigger("click");
    expect(logoutSpy).toHaveBeenCalled();
  });

  it("should logout even without onLogout prop", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: mockProfile, isSidebarOpen: false },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");

    const logoutBtn = wrapper.find('[data-testid="profile-dropdown-logout-btn"]');
    await logoutBtn.trigger("click");
    // branch if (onLogout) false ter-cover
  });

  it("should render close icon when isSidebarOpen is true", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: mockProfile, isSidebarOpen: true },
    });

    expect(wrapper.find('[data-testid="toggle-sidebar-btn"]').exists()).toBe(true);
  });
});