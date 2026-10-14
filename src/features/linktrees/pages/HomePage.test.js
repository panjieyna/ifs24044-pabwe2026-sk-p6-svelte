import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { linkTreesStore } from "../states/linkTreesStore";

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "User 1" };
  const mockLinkTrees = [
    {
      id: 101,
      user_id: 1,
      title: "My Portfolio",
      type: "public",
      description: "Links to work",
      cover: "https://example.com/cover1.jpg",
      total_links: 3,
      created_at: "2025-01-01T00:00:00Z",
      author: { name: "User 1", photo: "https://example.com/u1.jpg" },
    },
    {
      id: 102,
      user_id: 2,
      title: "Other Unlisted",
      type: "unlisted",
      description: "Secret stuff",
      cover: null,
      total_links: 1,
      created_at: "2025-01-02T00:00:00Z",
      author: { name: "User 2", photo: null },
    },
    {
      id: 103,
      user_id: 3,
      title: "Private Collection",
      type: "private",
      description: null,
      cover: null,
      total_links: 0,
      created_at: "2025-01-03T00:00:00Z",
      author: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() => Promise.resolve());
  });

  it("should return empty if profile is not present", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: null },
    });
    expect(wrapper.find('[data-testid="add-linktree-btn"]').exists()).toBe(false);
  });

  it("should render page header, stats, and link tree cards", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Daftar Link Tree");
    expect(wrapper.text()).toContain("My Portfolio");
    expect(wrapper.text()).toContain("Other Unlisted");
    expect(wrapper.text()).toContain("Private Collection");
  });

  it("should filter link trees by search query", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const searchInput = wrapper.find('[data-testid="search-input"]');
    await searchInput.setValue("Portfolio");

    expect(wrapper.text()).toContain("My Portfolio");
    expect(wrapper.text()).not.toContain("Other Unlisted");
  });

  it("should change filter is_me and reload link trees", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const loadSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() => Promise.resolve());

    const filterSelect = wrapper.find('[data-testid="filter-is-me-select"]');
    await filterSelect.setValue("1");
    await new Promise((r) => setTimeout(r, 10));

    expect(loadSpy).toHaveBeenCalledWith("1");
  });

  it("should navigate to detail page when detail button is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const detailBtn = wrapper.find('[data-testid="detail-linktree-btn-101"]');
    await detailBtn.trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/link-trees/101");
  });

  it("should open edit modal when edit button is clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const editBtn = wrapper.find('[data-testid="edit-linktree-btn-101"]');
    await editBtn.trigger("click");

    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);
  });

  it("should open add modal when add button is clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [],
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const addBtn = wrapper.find('[data-testid="add-linktree-btn"]');
    await addBtn.trigger("click");

    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(true);
  });

  it("should delete link tree after confirmation", async () => {
    const delSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteBtn = wrapper.find('[data-testid="delete-linktree-btn-101"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(delSpy).toHaveBeenCalledWith(101);
  });

  it("should not delete link tree if confirmation is cancelled", async () => {
    const delSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete");
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteBtn = wrapper.find('[data-testid="delete-linktree-btn-101"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(delSpy).not.toHaveBeenCalled();
  });

  it("should delete all link trees after confirmation", async () => {
    const delAllSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDeleteAll")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const delAllBtn = wrapper.find('[data-testid="delete-all-btn"]');
    await delAllBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(delAllSpy).toHaveBeenCalled();
  });

  it("should not delete all if confirmation is cancelled", async () => {
    const delAllSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeDeleteAll");
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const delAllBtn = wrapper.find('[data-testid="delete-all-btn"]');
    await delAllBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(delAllSpy).not.toHaveBeenCalled();
  });

  it("should reload on isLinkTreeDeleted reaction", async () => {
    const { linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const loadSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() => Promise.resolve());

    linkTreesStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(loadSpy).toHaveBeenCalled();
  });

  it("should reload on isLinkTreeDeletedAll reaction", async () => {
    const { linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const loadSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() => Promise.resolve());

    linkTreesStore.setIsLinkTreeDeletedAll(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(loadSpy).toHaveBeenCalled();
  });

  it("should render empty state when no link trees exist", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [],
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Tidak ada link tree ditemukan");
  });
});
