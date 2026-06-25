/**
 * Custom Tags Module - User-defined categories and tags
 */
const Tags = {
    STORAGE_KEY: 'finance_custom_tags',

    defaultCategories: [
        { id: 'food', nameHe: 'מזון ומסעדות', nameEn: 'Food & Restaurants', namePt: 'Alimentação e Restaurantes', nameEs: 'Comida y Restaurantes', icon: '🍕', color: '#ef4444' },
        { id: 'transport', nameHe: 'תחבורה ודלק', nameEn: 'Transportation', namePt: 'Transporte', nameEs: 'Transporte', icon: '🚗', color: '#3b82f6' },
        { id: 'shopping', nameHe: 'קניות', nameEn: 'Shopping', namePt: 'Compras', nameEs: 'Compras', icon: '🛍️', color: '#8b5cf6' },
        { id: 'entertainment', nameHe: 'בילויים', nameEn: 'Entertainment', namePt: 'Entretenimento', nameEs: 'Entretenimiento', icon: '🎬', color: '#f59e0b' },
        { id: 'bills', nameHe: 'חשבונות קבועים', nameEn: 'Bills', namePt: 'Contas Fixas', nameEs: 'Cuentas Fijas', icon: '📄', color: '#10b981' },
        { id: 'health', nameHe: 'בריאות', nameEn: 'Health', namePt: 'Saúde', nameEs: 'Salud', icon: '💊', color: '#ec4899' },
        { id: 'education', nameHe: 'חינוך', nameEn: 'Education', namePt: 'Educação', nameEs: 'Educación', icon: '📚', color: '#6366f1' },
        { id: 'other', nameHe: 'אחר', nameEn: 'Other', namePt: 'Outros', nameEs: 'Otros', icon: '📦', color: '#6b7280' }
    ],

    /**
     * Resolve a category's display name for the current language (he/en/pt/es) with en fallback.
     */
    localizedName(category) {
        if (!category) return '';
        const lang = (typeof I18n !== 'undefined' && I18n.currentLanguage) || 'he';
        const byLang = { he: category.nameHe, en: category.nameEn, pt: category.namePt, es: category.nameEs };
        return byLang[lang] || category.nameEn || category.nameHe || '';
    },

    /**
     * Get all categories (default + custom)
     */
    getCategories() {
        const custom = Storage.get(this.STORAGE_KEY) || { categories: [], tags: [] };
        return [...this.defaultCategories, ...custom.categories];
    },

    /**
     * Get custom data
     */
    getCustomData() {
        return Storage.get(this.STORAGE_KEY) || { categories: [], tags: [] };
    },

    /**
     * Save custom data
     */
    saveCustomData(data) {
        Storage.set(this.STORAGE_KEY, data);
    },

    /**
     * Add custom category
     */
    addCategory(category) {
        const data = this.getCustomData();
        category.id = category.id || Storage.generateId();
        category.isCustom = true;
        data.categories.push(category);
        this.saveCustomData(data);
        return category;
    },

    /**
     * Update category
     */
    updateCategory(id, updates) {
        const data = this.getCustomData();
        const index = data.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            data.categories[index] = { ...data.categories[index], ...updates };
            this.saveCustomData(data);
            return data.categories[index];
        }
        return null;
    },

    /**
     * Delete custom category
     */
    deleteCategory(id) {
        const data = this.getCustomData();
        data.categories = data.categories.filter(c => c.id !== id);
        this.saveCustomData(data);
    },

    /**
     * Get category by ID
     */
    getCategory(id) {
        return this.getCategories().find(c => c.id === id);
    },

    /**
     * Get category name
     */
    getCategoryName(id) {
        const category = this.getCategory(id);
        if (!category) return id;
        return this.localizedName(category);
    },

    /**
     * Get category color
     */
    getCategoryColor(id) {
        const category = this.getCategory(id);
        return category?.color || '#6b7280';
    },

    /**
     * Get category icon
     */
    getCategoryIcon(id) {
        const category = this.getCategory(id);
        return category?.icon || '📦';
    },

    // Tags (for additional labeling)
    /**
     * Get all tags
     */
    getTags() {
        const data = this.getCustomData();
        return data.tags || [];
    },

    /**
     * Add tag
     */
    addTag(tag) {
        const data = this.getCustomData();
        data.tags = data.tags || [];
        tag.id = tag.id || Storage.generateId();
        data.tags.push(tag);
        this.saveCustomData(data);
        return tag;
    },

    /**
     * Delete tag
     */
    deleteTag(id) {
        const data = this.getCustomData();
        data.tags = (data.tags || []).filter(t => t.id !== id);
        this.saveCustomData(data);
    },

    /**
     * Render category select options
     */
    renderCategoryOptions(selectedId = null) {
        const categories = this.getCategories();
        return categories.map(cat => {
            const name = this.localizedName(cat);
            const selected = cat.id === selectedId ? 'selected' : '';
            return `<option value="${cat.id}" ${selected}>${cat.icon} ${name}</option>`;
        }).join('');
    },

    /**
     * Render category badge
     */
    renderCategoryBadge(id) {
        const category = this.getCategory(id);
        if (!category) return id;

        const name = this.localizedName(category);
        return `<span class="category-badge" style="background: ${category.color}20; color: ${category.color}; border: 1px solid ${category.color};">
            ${category.icon} ${name}
        </span>`;
    }
};

// Make available globally
window.Tags = Tags;
