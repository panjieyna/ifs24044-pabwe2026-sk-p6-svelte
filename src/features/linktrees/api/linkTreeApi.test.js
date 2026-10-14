import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreeApi from "./linkTreeApi";
import apiHelper from "../../../helpers/apiHelper";

describe("linkTreeApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postLinkTree", () => {
    it("should send POST request and return data on success", async () => {
      const mockData = { link_tree_id: 1 };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: mockData }),
      });

      const result = await linkTreeApi.postLinkTree("My Links", "public", "Description");
      expect(result).toEqual(mockData);
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            title: "My Links",
            type: "public",
            description: "Description",
          }),
        })
      );
    });

    it("should throw error if response status is not success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal validasi" }),
      });

      await expect(linkTreeApi.postLinkTree("Title", "public", "Desc")).rejects.toThrow(
        "Gagal validasi"
      );
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(linkTreeApi.postLinkTree("Title", "public", "Desc")).rejects.toThrow(
        "Gagal menambahkan link tree"
      );
    });
  });

  describe("postLinkTreeCover", () => {
    it("should send multipart POST request and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah cover" }),
      });

      const file = new File(["dummy"], "cover.png", { type: "image/png" });
      const result = await linkTreeApi.postLinkTreeCover(1, file);
      expect(result).toBe("Berhasil mengubah cover");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/1/cover"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should handle cover without name fallback", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah cover" }),
      });

      const dummyBlob = new Blob(["test"]);
      const result = await linkTreeApi.postLinkTreeCover(1, dummyBlob);
      expect(result).toBe("Berhasil mengubah cover");
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Ukuran terlalu besar" }),
      });

      await expect(linkTreeApi.postLinkTreeCover(1, new Blob())).rejects.toThrow(
        "Ukuran terlalu besar"
      );
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(linkTreeApi.postLinkTreeCover(1, new Blob())).rejects.toThrow(
        "Gagal mengubah cover"
      );
    });
  });

  describe("putLinkTree", () => {
    it("should send PUT request and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah data" }),
      });

      const result = await linkTreeApi.putLinkTree(1, "Updated", "private", "New desc");
      expect(result).toBe("Berhasil mengubah data");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            title: "Updated",
            type: "private",
            description: "New desc",
          }),
        })
      );
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Error update" }),
      });

      await expect(linkTreeApi.putLinkTree(1, "T", "public", "D")).rejects.toThrow(
        "Error update"
      );
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(linkTreeApi.putLinkTree(1, "T", "public", "D")).rejects.toThrow(
        "Gagal mengubah link tree"
      );
    });
  });

  describe("getLinkTrees", () => {
    it("should fetch all link trees without param when is_me is empty", async () => {
      const mockTrees = [{ id: 1, title: "LT 1" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { link_trees: mockTrees } }),
      });

      const result = await linkTreeApi.getLinkTrees();
      expect(result).toEqual(mockTrees);
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringMatching(/\/link-trees\/$/),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should append ?is_me=1 when is_me param is provided", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { link_trees: [] } }),
      });

      await linkTreeApi.getLinkTrees(1);
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/?is_me=1"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should return empty array if link_trees data is null/undefined", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: {} }),
      });

      const result = await linkTreeApi.getLinkTrees();
      expect(result).toEqual([]);
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Unauthorized" }),
      });

      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Unauthorized");
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow(
        "Gagal mengambil data link tree"
      );
    });
  });

  describe("getLinkTreeById", () => {
    it("should fetch single link tree by id", async () => {
      const mockTree = { id: 1, title: "Detail LT" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { link_tree: mockTree } }),
      });

      const result = await linkTreeApi.getLinkTreeById(1);
      expect(result).toEqual(mockTree);
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Not found" }),
      });

      await expect(linkTreeApi.getLinkTreeById(99)).rejects.toThrow("Not found");
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(linkTreeApi.getLinkTreeById(99)).rejects.toThrow(
        "Gagal mengambil detail link tree"
      );
    });
  });

  describe("deleteLinkTree", () => {
    it("should delete link tree by id", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus data" }),
      });

      const result = await linkTreeApi.deleteLinkTree(1);
      expect(result).toBe("Berhasil menghapus data");
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal hapus" }),
      });

      await expect(linkTreeApi.deleteLinkTree(1)).rejects.toThrow("Gagal hapus");
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(linkTreeApi.deleteLinkTree(1)).rejects.toThrow(
        "Gagal menghapus link tree"
      );
    });
  });

  describe("deleteAllLinkTrees", () => {
    it("should delete all link trees", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus semua data link tree",
        }),
      });

      const result = await linkTreeApi.deleteAllLinkTrees();
      expect(result).toBe("Berhasil menghapus semua data link tree");
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Unauthenticated." }),
      });

      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow(
        "Unauthenticated."
      );
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow(
        "Gagal menghapus semua data link tree"
      );
    });
  });

  describe("postLinkTreeItem", () => {
    it("should post link tree item", async () => {
      const mockItem = { item_id: 1 };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: mockItem }),
      });

      const result = await linkTreeApi.postLinkTreeItem(1, "Item 1", "https://delcom.org");
      expect(result).toEqual(mockItem);
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/1/items"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "Item 1", url: "https://delcom.org" }),
        })
      );
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Invalid URL" }),
      });

      await expect(
        linkTreeApi.postLinkTreeItem(1, "Item", "invalid")
      ).rejects.toThrow("Invalid URL");
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(
        linkTreeApi.postLinkTreeItem(1, "Item", "invalid")
      ).rejects.toThrow("Gagal menambahkan item link tree");
    });
  });

  describe("putLinkTreeItem", () => {
    it("should update link tree item", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah data" }),
      });

      const result = await linkTreeApi.putLinkTreeItem(1, 2, "Item 2", "https://delcom.org");
      expect(result).toBe("Berhasil mengubah data");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/1/items/2"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ title: "Item 2", url: "https://delcom.org" }),
        })
      );
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Item not found" }),
      });

      await expect(
        linkTreeApi.putLinkTreeItem(1, 2, "Title", "https://delcom.org")
      ).rejects.toThrow("Item not found");
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(
        linkTreeApi.putLinkTreeItem(1, 2, "Title", "https://delcom.org")
      ).rejects.toThrow("Gagal mengubah item link tree");
    });
  });

  describe("deleteLinkTreeItem", () => {
    it("should delete link tree item", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus data" }),
      });

      const result = await linkTreeApi.deleteLinkTreeItem(1, 2);
      expect(result).toBe("Berhasil menghapus data");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/1/items/2"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Delete item error" }),
      });

      await expect(linkTreeApi.deleteLinkTreeItem(1, 2)).rejects.toThrow(
        "Delete item error"
      );
    });

    it("should use default error message if message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(linkTreeApi.deleteLinkTreeItem(1, 2)).rejects.toThrow(
        "Gagal menghapus item link tree"
      );
    });
  });
});
