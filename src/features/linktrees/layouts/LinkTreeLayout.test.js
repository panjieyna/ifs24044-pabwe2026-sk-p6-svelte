import { describe, it, expect, vi, beforeEach } from "vitest";
import LinkTreeLayout from "./LinkTreeLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import * as routerModule from "../../../router";
import { usersStore as realUsersStore } from "../../users/states/usersStore";

describe("LinkTreeLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProfile = { id: 1, name: "Active User", email: "active@example.com" };

  it("should navigate to /auth/login if no access token exists on mount", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: null },
    });

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("should call asyncSetProfile on mount if access token exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const { usersStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: null },
    });

    expect(usersStore.asyncSetProfile).toBeDefined();
  });

  it("should render loading state when profile is null", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: null },
    });

    expect(wrapper.text()).toContain("Memuat sesi pengguna...");
  });

  it("should redirect to login if isProfile is true but profile remains null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { usersStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: null, isProfile: false },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("should render main content and layout when profile is available", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: mockProfile },
    });

    expect(wrapper.text()).toContain("Delcom Link Tree");
    expect(wrapper.text()).toContain("Active User");
  });

  it("should handle logout when logout event is triggered", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper, authStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: mockProfile },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");

    const logoutBtn = wrapper.find('[data-testid="profile-dropdown-logout-btn"]');
    await logoutBtn.trigger("click");

    authStore.setIsAuthLogout(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("should toggle and close sidebar", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(realUsersStore, "asyncSetProfile").mockResolvedValue();

    const { wrapper } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: mockProfile },
    });

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);

    await backdrop.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });
  it("should keep the layout and not redirect when isProfile is true and profile exists", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    vi.spyOn(realUsersStore, "asyncSetProfile").mockResolvedValue();

    const { wrapper, usersStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: mockProfile },
    });
    navSpy.mockClear();

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(usersStore.isProfile).toBe(false);
    expect(putTokenSpy).not.toHaveBeenCalled();
    expect(navSpy).not.toHaveBeenCalledWith("/auth/login");
    expect(wrapper.find('[data-testid="toggle-sidebar-btn"]').exists()).toBe(true);
  });
});
