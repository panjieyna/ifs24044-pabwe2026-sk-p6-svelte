  <script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import AddModal from "../modals/AddModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    Plus,
    Link2,
    Layers,
    Eye,
    Pencil,
    Trash2,
    Funnel,
    Search,
    LoaderCircle,
    Globe,
    Lock,
    EyeOff,
  } from "lucide-svelte";

  let loadingLinkTrees = false;
  let filterIsMe = ""; // "" (semua) atau "1" (milik saya)
  let searchQuery = "";
  let showAddModal = false;
  let showChangeModal = false;
  let selectedLinkTreeId = null;

  $: profile = $usersStore.profile;
  $: linkTrees = $linkTreesStore.linkTrees || [];

  onMount(() => {
    loadLinkTrees();
  });

  function loadLinkTrees() {
    loadingLinkTrees = true;
    Promise.resolve(linkTreesStore.asyncSetLinkTrees(filterIsMe)).finally(() => {
      loadingLinkTrees = false;
    });
  }

  let prevFilter = filterIsMe;
  $: if (filterIsMe !== prevFilter) {
    prevFilter = filterIsMe;
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDeleted) {
    linkTreesStore.setIsLinkTreeDeleted(false);
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDeletedAll) {
    linkTreesStore.setIsLinkTreeDeletedAll(false);
    loadLinkTrees();
  }

  function handleEditLinkTree(linkTreeId) {
    selectedLinkTreeId = linkTreeId;
    showChangeModal = true;
  }

  async function handleDeleteLinkTree(linkTreeId) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus link tree ini?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDelete(linkTreeId);
    }
  }

  async function handleDeleteAllLinkTrees() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus SEMUA link tree milik Anda?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDeleteAll();
    }
  }

  $: filteredLinkTrees = linkTrees.filter((lt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = lt.title ? lt.title.toLowerCase() : "";
    const description = lt.description ? lt.description.toLowerCase() : "";
    const author = lt.author?.name ? lt.author.name.toLowerCase() : "";
    return title.includes(q) || description.includes(q) || author.includes(q);
  });

  $: totalCount = linkTrees.length;
  $: myCount = linkTrees.filter((lt) => lt.user_id === profile?.id).length;
  $: publicCount = linkTrees.filter((lt) => lt.type === "public").length;
</script>

{#if profile}
  <div class="space-y-8 animate-in fade-in duration-300">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Link Tree
        </h1>
        <p class="text-sm text-slate-600 mt-1">
          Kelola dan bagikan halaman kumpulan tautan penting Anda ke publik.
        </p>
      </div>
      <div class="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        <button
          type="button"
          data-testid="delete-all-btn"
          on:click={handleDeleteAllLinkTrees}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all"
        >
          <Trash2 size={16} />
          <span>Hapus Semua</span>
        </button>
        <button
          type="button"
          data-testid="add-linktree-btn"
          on:click={() => (showAddModal = true)}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Link Tree</span>
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-600">Total Ditampilkan</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{totalCount}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Layers size={22} />
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-600">Milik Saya</p>
          <p class="text-2xl font-black text-indigo-600 mt-1">{myCount}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <Link2 size={22} />
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-600">Tipe Publik</p>
          <p class="text-2xl font-black text-emerald-600 mt-1">{publicCount}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Globe size={22} />
        </div>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="relative flex-1 max-w-md">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
          <Search size={18} />
        </div>
        <input
          type="text"
          data-testid="search-input"
          bind:value={searchQuery}
          placeholder="Cari judul, deskripsi, atau pembuat..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
        />
      </div>

      <!-- Filter Milik Saya / Semua -->
      <div class="flex items-center gap-2">
        <Funnel size={16} class="text-slate-600 shrink-0 hidden sm:block" />
        <select
          data-testid="filter-is-me-select"
          aria-label="Filter kepemilikan link tree"
          bind:value={filterIsMe}
          class="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
        >
          <option value="">Semua Link Tree</option>
          <option value="1">Hanya Milik Saya</option>
        </select>
      </div>
    </div>

    <!-- Link Tree Cards Grid -->
    {#if loadingLinkTrees}
      <div class="flex flex-col items-center justify-center py-20">
        <LoaderCircle size={32} class="animate-spin text-indigo-600" />
        <p class="text-sm text-slate-600 mt-2">Memuat daftar link tree...</p>
      </div>
    {:else if filteredLinkTrees.length === 0}
      <div class="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <Link2 size={26} />
        </div>
        <h2 class="text-base font-bold text-slate-800">Tidak ada link tree ditemukan</h2>
        <p class="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
          {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Mulai dengan menambahkan link tree baru.'}
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredLinkTrees as lt (lt.id)}
          {@const isOwner = lt.user_id === profile.id}
          <div
            data-testid="linktree-card-{lt.id}"
            class="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
          >
            <!-- Cover image header -->
            <div class="h-40 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
              {#if lt.cover}
                <img
                  src={lt.cover}
                  alt={lt.title}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-white/40">
                  <Link2 size={48} />
                </div>
              {/if}

              <!-- Type badge -->
              <div class="absolute top-3 left-3">
                {#if lt.type === 'public'}
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-xs shadow-xs">
                    <Globe size={12} /> Publik
                  </span>
                {:else if lt.type === 'unlisted'}
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-xs shadow-xs">
                    <EyeOff size={12} /> Unlisted
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700/90 text-white backdrop-blur-xs shadow-xs">
                    <Lock size={12} /> Privat
                  </span>
                {/if}
              </div>

              <!-- Links Count badge -->
              <div class="absolute top-3 right-3">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-black/60 text-white backdrop-blur-xs shadow-xs">
                  {String(lt.total_links ?? 0)} tautan
                </span>
              </div>
            </div>

            <!-- Card Content Body -->
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h2 class="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {lt.title}
                </h2>
                <p class="text-xs text-slate-600 mt-1 line-clamp-2">
                  {lt.description || "Tidak ada deskripsi"}
                </p>
              </div>

              <!-- Author & Date -->
              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div class="flex items-center gap-2">
                  {#if lt.author?.photo}
                    <img
                      src={lt.author.photo}
                      alt={lt.author.name}
                      class="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                  {:else}
                    <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                      {lt.author?.name ? lt.author.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  {/if}
                  <span class="font-medium text-slate-700 truncate max-w-[120px]">
                    {lt.author?.name || 'Anonim'}
                  </span>
                </div>
                <span>{formatDate(lt.created_at)}</span>
              </div>

              <!-- Action buttons -->
              <div class="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  data-testid="detail-linktree-btn-{lt.id}"
                  on:click={() => navigate(`/link-trees/${lt.id}`)}
                  class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <Eye size={14} />
                  <span>Detail</span>
                </button>

                {#if isOwner}
                  <button
                    type="button"
                    data-testid="edit-linktree-btn-{lt.id}"
                    on:click={() => handleEditLinkTree(lt.id)}
                    class="p-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 transition-colors"
                    aria-label="Ubah Link Tree"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    data-testid="delete-linktree-btn-{lt.id}"
                    on:click={() => handleDeleteLinkTree(lt.id)}
                    class="p-2 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 transition-colors"
                    aria-label="Hapus Link Tree"
                  >
                    <Trash2 size={14} />
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<!-- Modals -->
<AddModal
  show={showAddModal}
  onClose={() => (showAddModal = false)}
/>

<ChangeModal
  show={showChangeModal}
  linkTreeId={selectedLinkTreeId}
  onClose={() => (showChangeModal = false)}
/>
