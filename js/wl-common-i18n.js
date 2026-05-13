/**
 * WizeMoney landing-page Hebrew → en/pt/es dictionary.
 * Paired with wl-text-i18n.js — runtime text-content swap, no HTML edits.
 *
 * Only contains strings visible on the FREE-tier landing/onboarding view.
 * If you add a new Hebrew string visible to logged-out or new users, add it
 * here in all 4 languages.
 */
(function () {
    var existing = window.WL_TR || {};
    var ensure = function (lang) { existing[lang] = existing[lang] || {}; return existing[lang]; };
    function tr(he, en, pt, es) {
        ensure('he')[he] = he;
        ensure('en')[he] = en;
        ensure('pt')[he] = pt;
        ensure('es')[he] = es;
    }

    tr('ברוכים הבאים ל-WizeMoney 👋', 'Welcome to WizeMoney 👋', 'Bem-vindo ao WizeMoney 👋', 'Bienvenido a WizeMoney 👋');
    tr('WizeMoney - ניהול פיננסי חכם', 'WizeMoney — Smart Financial Management', 'WizeMoney — Gestão Financeira Inteligente', 'WizeMoney — Gestión Financiera Inteligente');
    tr('ניהול פיננסי אישי', 'Personal financial management', 'Gestão financeira pessoal', 'Gestión financiera personal');
    tr('רגע אחד להתחיל — בחר מה להוסיף ראשון:', 'One moment to start — choose what to add first:', 'Um momento para começar — escolha o que adicionar primeiro:', 'Un momento para empezar — elige qué agregar primero:');
    tr('רשום את יתרות החשבונות שלך', 'Record your account balances', 'Registre os saldos de suas contas', 'Registra los saldos de tus cuentas');
    tr('עקוב אחרי ההוצאות החודשיות', 'Track your monthly expenses', 'Acompanhe suas despesas mensais', 'Sigue tus gastos mensuales');
    tr('סקירה כללית של הנכסים שלך', 'Overview of your assets', 'Visão geral dos seus ativos', 'Resumen de tus activos');
    tr('קרן השתלמות, פנסיה, גמל', 'Pension funds & retirement savings', 'Fundos de pensão e poupança', 'Fondos de pensiones y ahorros');
    tr('תמונה פיננסית מלאה', 'Full financial picture', 'Visão financeira completa', 'Panorama financiero completo');
    tr('סטטיסטיקות מהירות', 'Quick stats', 'Estatísticas rápidas', 'Estadísticas rápidas');
    tr('הוסף קרן / חיסכון', 'Add fund / savings', 'Adicionar fundo / poupança', 'Agregar fondo / ahorros');
    tr('הוסף כרטיס אשראי', 'Add credit card', 'Adicionar cartão de crédito', 'Agregar tarjeta de crédito');
    tr('הוסף חשבון בנק', 'Add bank account', 'Adicionar conta bancária', 'Agregar cuenta bancaria');
    tr('הוסף יעדי חיסכון', 'Add savings goals', 'Adicionar metas de poupança', 'Agregar metas de ahorro');
    tr('הגדר יעד חיסכון', 'Set savings goal', 'Definir meta de poupança', 'Establecer meta de ahorro');
    tr('פעולות אחרונות', 'Recent activity', 'Atividades recentes', 'Actividad reciente');
    tr('הוצאות חודשיות', 'Monthly expenses', 'Despesas mensais', 'Gastos mensuales');
    tr('התקדמות יעדים', 'Goal progress', 'Progresso das metas', 'Progreso de metas');
    tr('שווי חסכונות', 'Savings value', 'Valor da poupança', 'Valor de ahorros');
    tr('יתרת הלוואות', 'Loan balance', 'Saldo de empréstimos', 'Saldo de préstamos');
    tr('הוצאות אשראי', 'Credit expenses', 'Despesas de crédito', 'Gastos con crédito');
    tr('חלוקת נכסים', 'Asset allocation', 'Alocação de ativos', 'Distribución de activos');
    tr('שווי מניות', 'Stock value', 'Valor das ações', 'Valor de acciones');
    tr('שווי נכסים', 'Asset value', 'Valor dos ativos', 'Valor de activos');
    tr('שערי מטבע', 'Exchange rates', 'Taxas de câmbio', 'Tipos de cambio');
    tr('שווי נקי', 'Net worth', 'Patrimônio líquido', 'Patrimonio neto');
    tr('יתרת בנק', 'Bank balance', 'Saldo bancário', 'Saldo bancario');
    tr('טיפים חכמים', 'Smart tips', 'Dicas inteligentes', 'Consejos inteligentes');
    tr('התאמה אישית', 'Personalize', 'Personalizar', 'Personalizar');
    tr('הצג הכל', 'Show all', 'Mostrar tudo', 'Mostrar todo');
    tr('טוען...', 'Loading...', 'Carregando...', 'Cargando...');
    tr('אחר כך', 'Later', 'Mais tarde', 'Más tarde');
    tr('הגיע הזמן לשלוח את הסיכום הפיננסי שלך', 'Time to send your financial summary', 'Hora de enviar seu resumo financeiro', 'Hora de enviar tu resumen financiero');
    tr('📊 סיכום פיננסי', '📊 Financial summary', '📊 Resumo financeiro', '📊 Resumen financiero');
    tr('👁 תצוגה מקדימה', '👁 Preview', '👁 Pré-visualizar', '👁 Vista previa');
    tr('💬 שתף בוואטסאפ', '💬 Share on WhatsApp', '💬 Compartilhar no WhatsApp', '💬 Compartir en WhatsApp');
    tr('📧 מייל', '📧 Email', '📧 E-mail', '📧 Correo');
    tr('רכב, נסיעה, דירה — כל מה שחולמים', 'Car, trip, apartment — anything you dream of', 'Carro, viagem, apartamento — tudo o que você sonha', 'Coche, viaje, apartamento — todo lo que sueñas');
    tr('כל התכנים מיועדים למטרות מידע בלבד ואינם מהווים ייעוץ פיננסי.', 'All content is for informational purposes only and does not constitute financial advice.', 'Todo o conteúdo é apenas para fins informativos e não constitui consultoria financeira.', 'Todo el contenido es solo para fines informativos y no constituye asesoría financiera.');
    tr('© 2026 WizeMoney. כל הזכויות שמורות.', '© 2026 WizeMoney. All rights reserved.', '© 2026 WizeMoney. Todos os direitos reservados.', '© 2026 WizeMoney. Todos los derechos reservados.');
    // Family-member onboarding chips that appeared in the i18n-leak audit
    tr('אני', 'Me', 'Eu', 'Yo');
    tr('מבוגר', 'Adult', 'Adulto', 'Adulto');
    tr('הוסף בן משפחה', 'Add family member', 'Adicionar membro da família', 'Agregar familiar');

    window.WL_TR = existing;
})();
