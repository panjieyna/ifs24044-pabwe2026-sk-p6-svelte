import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreesStore, { useLinkTreesStore } from "./linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("linkTreesStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkTreesStore.reset();
  });

  it("should initialize with correct default state and getters", () => {
    expect(linkTreesStore.linkTrees).toEqual([]);
    expect(linkTreesStore.linkTree).toBeNull();
    expect(linkTreesStore.isLinkTree).toBe(false);
    expect(linkTreesStore.isLinkTreeAdd).toBe(false);
    expect(linkTreesStore.isLinkTreeAdded).toBe(false);
    expect(linkTreesStore.isLinkTreeChange).toBe(false);
    expect(linkTreesStore.isLinkTreeChanged).toBe(false);
    expect(linkTreesStore.isLinkTreeChangeCover).toBe(false);
    expect(linkTreesStore.isLinkTreeChangedCover).toBe(false);
    expect(linkTreesStore.isLinkTreeDelete).toBe(false);
    expect(linkTreesStore.isLinkTreeDeleted).toBe(false);
    expect(linkTreesStore.isLinkTreeDeleteAll).toBe(false);
    expect(linkTreesStore.isLinkTreeDeletedAll).toBe(false);
    expect(linkTreesStore.isItemAdd).toBe(false);
    expect(linkTreesStore.isItemAdded).toBe(false);
    expect(linkTreesStore.isItemChange).toBe(false);
    expect(linkTreesStore.isItemChanged).toBe(false);
    expect(linkTreesStore.isItemDelete).toBe(false);
    expect(linkTreesStore.isItemDeleted).toBe(false);
    expect(useLinkTreesStore()).toBe(linkTreesStore);
  });

  it("should set and update states via setters", () => {
    linkTreesStore.setLinkTrees([{ id: 1 }]);
    expect(linkTreesStore.linkTrees).toEqual([{ id: 1 }]);

    linkTreesStore.setLinkTree({ id: 1, title: "Test" });
    expect(linkTreesStore.linkTree).toEqual({ id: 1, title: "Test" });

    linkTreesStore.setIsLinkTree(true);
    expect(linkTreesStore.isLinkTree).toBe(true);

    linkTreesStore.setIsLinkTreeAdd(true);
    expect(linkTreesStore.isLinkTreeAdd).toBe(true);

    linkTreesStore.setIsLinkTreeAdded(true);
    expect(linkTreesStore.isLinkTreeAdded).toBe(true);

    linkTreesStore.setIsLinkTreeChange(true);
    expect(linkTreesStore.isLinkTreeChange).toBe(true);

    linkTreesStore.setIsLinkTreeChanged(true);
    expect(linkTreesStore.isLinkTreeChanged).toBe(true);

    linkTreesStore.setIsLinkTreeChangeCover(true);
    expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);

    linkTreesStore.setIsLinkTreeChangedCover(true);
    expect(linkTreesStore.isLinkTreeChangedCover).toBe(true);

    linkTreesStore.setIsLinkTreeDelete(true);
    expect(linkTreesStore.isLinkTreeDelete).toBe(true);

    linkTreesStore.setIsLinkTreeDeleted(true);
    expect(linkTreesStore.isLinkTreeDeleted).toBe(true);

    linkTreesStore.setIsLinkTreeDeleteAll(true);
    expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);

    linkTreesStore.setIsLinkTreeDeletedAll(true);
    expect(linkTreesStore.isLinkTreeDeletedAll).toBe(true);

    linkTreesStore.setIsItemAdd(true);
    expect(linkTreesStore.isItemAdd).toBe(true);

    linkTreesStore.setIsItemAdded(true);
    expect(linkTreesStore.isItemAdded).toBe(true);

    linkTreesStore.setIsItemChange(true);
    expect(linkTreesStore.isItemChange).toBe(true);

    linkTreesStore.setIsItemChanged(true);
    expect(linkTreesStore.isItemChanged).toBe(true);

    linkTreesStore.setIsItemDelete(true);
    expect(linkTreesStore.isItemDelete).toBe(true);

    linkTreesStore.setIsItemDeleted(true);
    expect(linkTreesStore.isItemDeleted).toBe(true);
  });

  describe("asyncSetLinkTrees", () => {
    it("should fetch and set link trees successfully", async () => {
      const mockTrees = [{ id: 1, title: "Tree 1" }];
      vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue(mockTrees);

      await linkTreesStore.asyncSetLinkTrees();
      expect(linkTreesStore.linkTrees).toEqual(mockTrees);
    });

    it("should set empty array on failure", async () => {
      vi.spyOn(linkTreeApi, "getLinkTrees").mockRejectedValue(new Error("API Error"));

      await linkTreesStore.asyncSetLinkTrees();
      expect(linkTreesStore.linkTrees).toEqual([]);
    });
  });

  describe("asyncSetLinkTree", () => {
    it("should fetch and set single link tree successfully", async () => {
      const mockTree = { id: 1, title: "Tree 1" };
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockTree);

      await linkTreesStore.asyncSetLinkTree(1);
      expect(linkTreesStore.linkTree).toEqual(mockTree);
      expect(linkTreesStore.isLinkTree).toBe(true);
    });

    it("should set null on failure", async () => {
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("API Error"));

      await linkTreesStore.asyncSetLinkTree(99);
      expect(linkTreesStore.linkTree).toBeNull();
      expect(linkTreesStore.isLinkTree).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeAdd", () => {
    it("should handle success and show success dialog", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "postLinkTree").mockResolvedValue({ link_tree_id: 1 });

      await linkTreesStore.asyncSetIsLinkTreeAdd("New Tree", "public", "Desc");
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil ditambahkan!");
      expect(linkTreesStore.isLinkTreeAdded).toBe(true);
      expect(linkTreesStore.isLinkTreeAdd).toBe(true);
    });

    it("should handle error and show error dialog", async () => {
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "postLinkTree").mockRejectedValue(new Error("Validasi error"));

      await linkTreesStore.asyncSetIsLinkTreeAdd("Title", "public", "Desc");
      expect(errorSpy).toHaveBeenCalledWith("Validasi error");
      expect(linkTreesStore.isLinkTreeAdded).toBe(false);
      expect(linkTreesStore.isLinkTreeAdd).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChange", () => {
    it("should update link tree successfully", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("Berhasil update");

      await linkTreesStore.asyncSetIsLinkTreeChange(1, "Updated", "private", "Desc");
      expect(successSpy).toHaveBeenCalledWith("Berhasil update");
      expect(linkTreesStore.isLinkTreeChanged).toBe(true);
      expect(linkTreesStore.isLinkTreeChange).toBe(true);
    });

    it("should handle fallback message when response is empty", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("");

      await linkTreesStore.asyncSetIsLinkTreeChange(1, "Updated", "private", "Desc");
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil diperbarui!");
    });

    it("should handle failure and show error dialog", async () => {
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "putLinkTree").mockRejectedValue(new Error("Update fail"));

      await linkTreesStore.asyncSetIsLinkTreeChange(1, "U", "public", "D");
      expect(errorSpy).toHaveBeenCalledWith("Update fail");
      expect(linkTreesStore.isLinkTreeChanged).toBe(false);
      expect(linkTreesStore.isLinkTreeChange).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChangeCover", () => {
    it("should change cover successfully", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("Cover updated");

      await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new Blob());
      expect(successSpy).toHaveBeenCalledWith("Cover updated");
      expect(linkTreesStore.isLinkTreeChangedCover).toBe(true);
      expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);
    });

    it("should handle empty response message with fallback", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("");

      await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new Blob());
      expect(successSpy).toHaveBeenCalledWith("Cover link tree berhasil diperbarui!");
    });

    it("should handle failure and show error dialog", async () => {
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockRejectedValue(new Error("Cover error"));

      await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new Blob());
      expect(errorSpy).toHaveBeenCalledWith("Cover error");
      expect(linkTreesStore.isLinkTreeChangedCover).toBe(false);
      expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeDelete", () => {
    it("should delete link tree successfully", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("Deleted");

      await linkTreesStore.asyncSetIsLinkTreeDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Deleted");
      expect(linkTreesStore.isLinkTreeDeleted).toBe(true);
      expect(linkTreesStore.isLinkTreeDelete).toBe(true);
    });

    it("should use fallback message when message is empty", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("");

      await linkTreesStore.asyncSetIsLinkTreeDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil dihapus!");
    });

    it("should handle failure and show error dialog", async () => {
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockRejectedValue(new Error("Delete error"));

      await linkTreesStore.asyncSetIsLinkTreeDelete(1);
      expect(errorSpy).toHaveBeenCalledWith("Delete error");
      expect(linkTreesStore.isLinkTreeDeleted).toBe(false);
      expect(linkTreesStore.isLinkTreeDelete).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeDeleteAll", () => {
    it("should delete all link trees successfully", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("All deleted");

      await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
      expect(successSpy).toHaveBeenCalledWith("All deleted");
      expect(linkTreesStore.isLinkTreeDeletedAll).toBe(true);
      expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);
    });

    it("should use fallback message when message is empty", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("");

      await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
      expect(successSpy).toHaveBeenCalledWith("Semua link tree berhasil dihapus!");
    });

    it("should handle failure and show error dialog", async () => {
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockRejectedValue(new Error("Fail delete all"));

      await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
      expect(errorSpy).toHaveBeenCalledWith("Fail delete all");
      expect(linkTreesStore.isLinkTreeDeletedAll).toBe(false);
      expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);
    });
  });

  describe("asyncSetIsItemAdd", () => {
    it("should add item successfully", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "postLinkTreeItem").mockResolvedValue({ item_id: 1 });

      await linkTreesStore.asyncSetIsItemAdd(1, "Item", "https://delcom.org");
      expect(successSpy).toHaveBeenCalledWith("Item tautan berhasil ditambahkan!");
      expect(linkTreesStore.isItemAdded).toBe(true);
      expect(linkTreesStore.isItemAdd).toBe(true);
    });

    it("should handle add item failure", async () => {
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "postLinkTreeItem").mockRejectedValue(new Error("Invalid"));

      await linkTreesStore.asyncSetIsItemAdd(1, "Item", "invalid");
      expect(errorSpy).toHaveBeenCalledWith("Invalid");
      expect(linkTreesStore.isItemAdded).toBe(false);
      expect(linkTreesStore.isItemAdd).toBe(true);
    });
  });

  describe("asyncSetIsItemChange", () => {
    it("should change item successfully", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue("Updated item");

      await linkTreesStore.asyncSetIsItemChange(1, 2, "Title", "https://delcom.org");
      expect(successSpy).toHaveBeenCalledWith("Updated item");
      expect(linkTreesStore.isItemChanged).toBe(true);
      expect(linkTreesStore.isItemChange).toBe(true);
    });

    it("should use fallback message when response is empty", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue("");

      await linkTreesStore.asyncSetIsItemChange(1, 2, "Title", "https://delcom.org");
      expect(successSpy).toHaveBeenCalledWith("Item tautan berhasil diperbarui!");
    });

    it("should handle change item failure", async () => {
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "putLinkTreeItem").mockRejectedValue(new Error("Update fail"));

      await linkTreesStore.asyncSetIsItemChange(1, 2, "Title", "https://delcom.org");
      expect(errorSpy).toHaveBeenCalledWith("Update fail");
      expect(linkTreesStore.isItemChanged).toBe(false);
      expect(linkTreesStore.isItemChange).toBe(true);
    });
  });

  describe("asyncSetIsItemDelete", () => {
    it("should delete item successfully", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue("Item deleted");

      await linkTreesStore.asyncSetIsItemDelete(1, 2);
      expect(successSpy).toHaveBeenCalledWith("Item deleted");
      expect(linkTreesStore.isItemDeleted).toBe(true);
      expect(linkTreesStore.isItemDelete).toBe(true);
    });

    it("should use fallback message when response is empty", async () => {
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue("");

      await linkTreesStore.asyncSetIsItemDelete(1, 2);
      expect(successSpy).toHaveBeenCalledWith("Item tautan berhasil dihapus!");
    });

    it("should handle delete item failure", async () => {
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockRejectedValue(new Error("Delete fail"));

      await linkTreesStore.asyncSetIsItemDelete(1, 2);
      expect(errorSpy).toHaveBeenCalledWith("Delete fail");
      expect(linkTreesStore.isItemDeleted).toBe(false);
      expect(linkTreesStore.isItemDelete).toBe(true);
    });
  });
});
