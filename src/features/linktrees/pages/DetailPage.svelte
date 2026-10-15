<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import MarkdownViewer from "../components/MarkdownViewer.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    ArrowLeft,
    ImagePlus,
    PenLine,
    Trash2,
    Calendar,
    Globe,
    Lock,
    EyeOff,
    Plus,
    ExternalLink,
    Pencil,
    Link2,
  } from "lucide-svelte";

  export let linkTreeId;

  $: profile = $usersStore.profile;
  $: linkTree = $linkTreesStore.linkTree;
  $: isOwner = Boolean(profile && linkTree && linkTree.user_id === profile.id);

  let showCoverModal = false;
  let showEditModal = false;
  let showItemModal = false;
  let selectedItem = null;

  onMount(() => {
    if (linkTreeId) {
      linkTreesStore.asyncSetLinkTree(linkTreeId);
    }
  });

  let prevId = linkTreeId;
  $: if (linkTreeId !== prevId) {
    prevId = linkTreeId;
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  $: if ($linkTreesStore.isLinkTree) {
    linkTreesStore.setIsLinkTree(false);
    if (!linkTree) {
      navigate("/");
    }
  }

  $: if ($linkTreesStore.isLinkTreeDeleted) {
    linkTreesStore.setIsLinkTreeDeleted(false);
    navigate("/");
  }

  $: if ($linkTreesStore.isItemDeleted) {
    linkTreesStore.setIsItemDeleted(false);
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  async function handleDelete() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus link tree ini beserta seluruh tautannya?");
    if (result.isConfirmed && linkTree) {
      linkTreesStore.asyncSetIsLinkTreeDelete(linkTree.id);
    }
  }

  function handleAddItem() {
    selectedItem = null;
    showItemModal = true;
  }

  function handleEditItem(item) {
    selectedItem = item;
    showItemModal = true;
  }

  async function handleDeleteItem(itemId) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus tautan ini?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsItemDelete(linkTree.id, itemId);
    }
  }
</script>

{#if !profile || !linkTree}
  <div class="flex flex-col items-center justify-center py-20">
    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
    <!-- Back button & Action buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <a
        href="/"
        data-testid="back-to-linktrees-link"
        on:click|preventDefault={() => navigate("/")}
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Kembali ke Semua Link Tree
      </a>

      {#if isOwner}
        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            data-testid="edit-cover-btn"
            on:click={() => (showCoverModal = true)}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
          >
            <ImagePlus size={16} />
            Ubah Cover
          </button>
          <button
            type="button"
            data-testid="edit-detail-linktree-btn"
            on:click={() => (showEditModal = true)}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
          >
            <PenLine size={16} />
            Ubah Data
          </button>
          <button
            type="button"
            data-testid="delete-detail-linktree-btn"
            on:click={handleDelete}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
          >
            <Trash2 size={16} />
            Hapus Link Tree
          </button>
        </div>
      {/if}
    </div>

    <!-- Main Detail Card -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Cover Banner -->
      <div class="h-64 sm:h-72 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
        {#if linkTree.cover}
          <img
            src={linkTree.cover}
            alt={linkTree.title}
            class="w-full h-full object-cover"
          />
        {:else}
          <div class="w-full h-full flex items-center justify-center text-white/40">
            <Link2 size={64} />
          </div>
        {/if}

        <!-- Visibility Badge -->
        <div class="absolute top-4 left-4">
          {#if linkTree.type === 'public'}
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-xs shadow-md">
              <Globe size={14} /> Publik
            </span>
          {:else if linkTree.type === 'unlisted'}
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-xs shadow-md">
              <EyeOff size={14} /> Unlisted
            </span>
          {:else}
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 text-white backdrop-blur-xs shadow-md">
              <Lock size={14} /> Privat
            </span>
          {/if}
        </div>
      </div>

      <div class="p-6 sm:p-8 space-y-6">
        <!-- Title & Author Info -->
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {linkTree.title}
          </h1>

          <div class="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
            <div class="flex items-center gap-2">
              {#if linkTree.author?.photo}
                <img
                  src={linkTree.author.photo}
                  alt={linkTree.author.name}
                  class="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
              {:else}
                <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                  {linkTree.author?.name ? linkTree.author.name.charAt(0).toUpperCase() : 'U'}
                </div>
              {/if}
              <span class="font-medium text-slate-700">
                {linkTree.author?.name || 'Anonim'}
              </span>
            </div>

            <div class="flex items-center gap-1 text-slate-400">
              <Calendar size={14} />
              <span>Dibuat: {formatDate(linkTree.created_at)}</span>
            </div>
          </div>
        </div>

        <!-- Description Viewer -->
        <div class="pt-4 border-t border-slate-100">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deskripsi</p>
          <MarkdownViewer content={linkTree.description || ""} />
        </div>

        <!-- Links Items Section -->
        <div class="pt-6 border-t border-slate-100 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-slate-800">Daftar Tautan</h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                {(linkTree.items || []).length}
              </span>
            </div>

            {#if isOwner}
              <button
                type="button"
                data-testid="add-item-btn"
                on:click={handleAddItem}
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Tautan</span>
              </button>
            {/if}
          </div>

          {#if !linkTree.items || linkTree.items.length === 0}
            <div class="text-center py-10 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
              <Link2 size={24} class="mx-auto text-slate-400 mb-2" />
              <p class="text-sm font-semibold text-slate-600">Belum ada tautan ditambahkan</p>
              {#if isOwner}
                <p class="text-xs text-slate-400 mt-0.5">Klik tombol di atas untuk menambahkan tautan pertama Anda.</p>
              {/if}
            </div>
          {:else}
            <div class="space-y-3">
              {#each linkTree.items as item (item.id)}
                <div
                  data-testid="linktree-item-{item.id}"
                  class="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all group"
                >
                  <div class="flex items-center gap-3 min-w-0 pr-3">
                    <div class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Link2 size={18} />
                    </div>
                    <div class="min-w-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-sm font-bold text-slate-800 hover:text-indigo-600 flex items-center gap-1.5 transition-colors truncate"
                      >
                        <span class="truncate">{item.title}</span>
                        <ExternalLink size={13} class="text-slate-400 shrink-0" />
                      </a>
                      <p class="text-xs text-slate-400 truncate mt-0.5">{item.url}</p>
                    </div>
                  </div>

                  {#if isOwner}
                    <div class="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        data-testid="edit-item-btn-{item.id}"
                        on:click={() => handleEditItem(item)}
                        class="p-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 transition-colors"
                        aria-label="Ubah Tautan"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        data-testid="delete-item-btn-{item.id}"
                        on:click={() => handleDeleteItem(item.id)}
                        class="p-2 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 transition-colors"
                        aria-label="Hapus Tautan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Modals -->
{#if linkTree}
  <ChangeCoverModal
    show={showCoverModal}
    {linkTree}
    onClose={() => (showCoverModal = false)}
  />

  <ChangeModal
    show={showEditModal}
    linkTreeId={linkTree.id}
    onClose={() => (showEditModal = false)}
  />

  <ItemModal
    show={showItemModal}
    linkTreeId={linkTree.id}
    item={selectedItem}
    onClose={() => (showItemModal = false)}
  />
{/if}
