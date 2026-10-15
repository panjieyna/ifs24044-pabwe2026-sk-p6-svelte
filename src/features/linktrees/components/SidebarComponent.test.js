import { describe, it, expect, vi, beforeEach } from "vitest";
import SidebarComponent from "./SidebarComponent.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("SidebarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navigation items", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: false },
      route: "/",
    });

    expect(wrapper.text()).toContain("Menu Utama");
    expect(wrapper.text()).toContain("Semua Link Tree");
    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("should highlight active item matching exact route", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: false },
      route: "/",
    });

    const homeLink = wrapper.find('a[href="/"]');
    expect(homeLink.classes("bg-indigo-600")).toBe(true);
  });

  it("should highlight active item matching prefix route", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: false },
      route: "/users",
    });

    const usersLink = wrapper.find('a[href="/users"]');
    expect(usersLink.classes("bg-indigo-600")).toBe(true);
  });

  it("should handle navigation on click and trigger onCloseMobile", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const closeSpy = vi.fn();

    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: true, onCloseMobile: closeSpy },
    });

    const profileLink = wrapper.find('a[href="/profile"]');
    await profileLink.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/profile");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should close mobile sidebar on backdrop click", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: true, onCloseMobile: closeSpy },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);
    await backdrop.trigger("click");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should close mobile sidebar on Escape keydown", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: true, onCloseMobile: closeSpy },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("keydown", { key: "Escape" });
    expect(closeSpy).toHaveBeenCalled();

    await backdrop.trigger("keydown", { key: "Enter" });
  });

  // Cover false branch of if (onCloseMobile)
  it("should close mobile sidebar on backdrop click without onCloseMobile prop", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: true },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);
    await backdrop.trigger("click");
  });

  it("should close mobile sidebar on Escape without onCloseMobile prop", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: true },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("keydown", { key: "Escape" });
  });

  it("should handle navigation without onCloseMobile prop", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: true },
    });

    const profileLink = wrapper.find('a[href="/profile"]');
    await profileLink.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/profile");
  });
});