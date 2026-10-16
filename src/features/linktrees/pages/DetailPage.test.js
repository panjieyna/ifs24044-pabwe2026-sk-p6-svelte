import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { linkTreesStore } from "../states/linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Owner User" };
  const mockLinkTree = {
    id: 10,
    user_id: 1,
    title: "Delcom Links",
    type: "public",
    description: "Welcome to my links",
    cover: "https://example.com/cover.jpg",
    created_at: "2025-01-01T00:00:00Z",
    author: { name: "Owner User", photo: "https://example.com/owner.jpg" },
    items: [
      { id: 1, title: "Website", url: "https://delcom.org" },
      { id: 2, title: "Docs", url: "https://docs.delcom.org" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
  });

  it("should render loading state when linkTree is null", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: null },
    });

    expect(wrapper.find(".animate-spin").exists()).toBe(true);
  });

  it("should render linkTree details and items when loaded", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    expect(wrapper.text()).toContain("Delcom Links");
    expect(wrapper.text()).toContain("Publik");
    expect(wrapper.text()).toContain("Website");
    expect(wrapper.text()).toContain("Docs");
  });

  it("should navigate to home if linkTree is null after fetch when isLinkTree is true", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: null, isLinkTree: false },
    });

    linkTreesStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should navigate to home when isLinkTreeDeleted becomes true", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    linkTreesStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should reload link tree when isItemDeleted becomes true", async () => {
    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    const setSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());

    linkTreesStore.setIsItemDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setSpy).toHaveBeenCalledWith(10);
  });

  it("should open cover modal and edit modal", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    const coverBtn = wrapper.find('[data-testid="edit-cover-btn"]');
    await coverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    const editBtn = wrapper.find('[data-testid="edit-detail-linktree-btn"]');
    await editBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);
  });

  it("should close the edit modal through its onClose callback", async () => {
    // Jangan bergantung pada jaringan: data yang dimuat modal harus di-mock
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    await wrapper.find('[data-testid="edit-detail-linktree-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should delete link tree after confirmation", async () => {
    const delSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    const delBtn = wrapper.find('[data-testid="delete-detail-linktree-btn"]');
    await delBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(delSpy).toHaveBeenCalledWith(10);
  });

  it("should not delete link tree if confirmation is cancelled", async () => {
    const delSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete");
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    const delBtn = wrapper.find('[data-testid="delete-detail-linktree-btn"]');
    await delBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(delSpy).not.toHaveBeenCalled();
  });

  it("should open item modal for Add and Edit item", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    const addBtn = wrapper.find('[data-testid="add-item-btn"]');
    await addBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Tambah Item Tautan Baru");

    // Close and open edit
    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");

    const editItemBtn = wrapper.find('[data-testid="edit-item-btn-1"]');
    await editItemBtn.trigger("click");
    expect(wrapper.text()).toContain("Ubah Item Tautan");
  });

  it("should delete item after confirmation", async () => {
    const delItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    const delItemBtn = wrapper.find('[data-testid="delete-item-btn-1"]');
    await delItemBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(delItemSpy).toHaveBeenCalledWith(10, 1);
  });

  it("should not delete item if confirmation cancelled", async () => {
    const delItemSpy = vi.spyOn(linkTreesStore, "asyncSetIsItemDelete");
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    const delItemBtn = wrapper.find('[data-testid="delete-item-btn-1"]');
    await delItemBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(delItemSpy).not.toHaveBeenCalled();
  });

  it("should render unlisted and private badges correctly", () => {
    const { wrapper: unlistedWrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 11 },
      preloadedState: {
        profile: mockProfile,
        linkTree: { ...mockLinkTree, id: 11, type: "unlisted", cover: null, author: null, items: [] },
      },
    });
    expect(unlistedWrapper.text()).toContain("Unlisted");
    expect(unlistedWrapper.text()).toContain("Belum ada tautan ditambahkan");

    const { wrapper: privateWrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 12 },
      preloadedState: {
        profile: mockProfile,
        linkTree: { ...mockLinkTree, id: 12, type: "private", cover: null, author: { name: "No Photo" } },
      },
    });
    expect(privateWrapper.text()).toContain("Privat");
  });

  it("should navigate back to link trees on back link click", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    const backLink = wrapper.find('[data-testid="back-to-linktrees-link"]');
    await backLink.trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/");
  });
  it("should not fetch link tree on mount when linkTreeId is empty", () => {
    const setSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    setSpy.mockClear();

    renderWithProviders(DetailPage, {
      props: { linkTreeId: undefined },
      preloadedState: { profile: mockProfile, linkTree: null },
    });

    expect(setSpy).not.toHaveBeenCalled();
  });

  it("should fetch the new link tree when linkTreeId prop changes", async () => {
    const { rerender } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    const setSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    setSpy.mockClear();

    await rerender({ linkTreeId: 20 });
    await new Promise((r) => setTimeout(r, 10));

    expect(setSpy).toHaveBeenCalledWith(20);
  });

  it("should stay on the page when isLinkTree becomes true and link tree exists", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree, isLinkTree: false },
    });
    navSpy.mockClear();

    store.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).not.toHaveBeenCalled();
    expect(store.$state.isLinkTree).toBe(false);
  });

  it("should close the cover modal through its onClose callback", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    await wrapper.find('[data-testid="edit-cover-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-cover-modal-btn"]').trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should hide owner actions for a visitor who is not the owner", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: { id: 99, name: "Visitor" }, linkTree: mockLinkTree },
    });

    expect(wrapper.text()).toContain("Website");
    expect(wrapper.find('[data-testid="edit-cover-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="add-item-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="edit-item-btn-1"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="delete-item-btn-1"]').exists()).toBe(false);
  });

  it("should render safely when description, items and author are missing", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 13 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          id: 13,
          user_id: 1,
          title: "Sparse Tree",
          type: "public",
          cover: null,
          created_at: "2025-01-01T00:00:00Z",
        },
      },
    });

    expect(wrapper.text()).toContain("Sparse Tree");
    expect(wrapper.text()).toContain("Anonim");
    expect(wrapper.text()).toContain("Belum ada tautan ditambahkan");
    expect(wrapper.text()).toContain("Klik tombol di atas untuk menambahkan tautan pertama Anda.");
  });

  it("should show fallback initial U when author has no name and no photo", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 14 },
      preloadedState: {
        profile: mockProfile,
        linkTree: { ...mockLinkTree, id: 14, author: {}, items: [] },
      },
    });

    expect(wrapper.text()).toContain("Anonim");
    expect(wrapper.text()).toContain("U");
  });
  it("should react when ownership changes while items are displayed", async () => {
    const { wrapper, usersStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    expect(wrapper.find('[data-testid="edit-item-btn-1"]').exists()).toBe(true);

    usersStore.setProfile({ id: 99, name: "Visitor" });
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="edit-item-btn-1"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="add-item-btn"]').exists()).toBe(false);

    usersStore.setProfile(mockProfile);
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="edit-item-btn-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-item-btn"]').exists()).toBe(true);
  });

  it("should react when ownership changes while the list is empty", async () => {
    const emptyTree = { ...mockLinkTree, id: 15, items: [] };
    const { wrapper, usersStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 15 },
      preloadedState: { profile: { id: 99, name: "Visitor" }, linkTree: emptyTree },
    });

    expect(wrapper.text()).toContain("Belum ada tautan ditambahkan");
    expect(wrapper.text()).not.toContain("Klik tombol di atas");

    usersStore.setProfile(mockProfile);
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).toContain("Klik tombol di atas");

    usersStore.setProfile({ id: 99, name: "Visitor" });
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).not.toContain("Klik tombol di atas");
  });

  it("should switch between empty state and item list when items change", async () => {
    const { wrapper, linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    store.setLinkTree({ ...mockLinkTree, items: [] });
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).toContain("Belum ada tautan ditambahkan");

    store.setLinkTree(mockLinkTree);
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).not.toContain("Belum ada tautan ditambahkan");
    expect(wrapper.find('[data-testid="linktree-item-1"]').exists()).toBe(true);
  });
  it("should update rendered items in place when item data changes but ids stay the same", async () => {
    const { wrapper, linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 10 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    store.setLinkTree({
      ...mockLinkTree,
      items: mockLinkTree.items.map((item) => ({ ...item, title: `${item.title} v2` })),
    });
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Website v2");
    expect(wrapper.text()).toContain("Docs v2");
    expect(wrapper.find('[data-testid="linktree-item-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-item-btn-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="delete-item-btn-2"]').exists()).toBe(true);
  });
  it("should render item controls with empty test ids when an item has no id", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 16 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          id: 16,
          items: [{ title: "Tanpa ID", url: "https://noid.example.com" }],
        },
      },
    });

    expect(wrapper.text()).toContain("Tanpa ID");
    expect(wrapper.find('[data-testid="linktree-item-"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-item-btn-"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="delete-item-btn-"]').exists()).toBe(true);
  });
});
