#!/usr/bin/env npx tsx
/**
 * Generate translation files for all supported languages
 * Event-focused (weddings, parties, corporate events, celebrations)
 */

import * as fs from "node:fs";
import * as path from "node:path";

const translations: Record<string, object> = {
	de: {
		metadata: {
			title: "Photocall - Fotobox für Events",
			description:
				"Moderne Fotobox für Hochzeiten, Partys, Firmenevents und Feiern. Einfache Einrichtung, schöne Vorlagen, sofortiges Teilen.",
			keywords: "Fotobox, Event Fotobox, Hochzeitsfotobox, Party Fotos, Firmenevents, Kiosk",
		},
		nav: {
			admin: "Admin",
			dashboard: "Dashboard",
			signIn: "Anmelden",
			startKiosk: "Kiosk Starten",
		},
		hero: {
			title: "Unvergessliche",
			titleHighlight: "Event-Momente",
			subtitle:
				"Moderne Fotobox für Hochzeiten, Partys und Firmenevents. Einfache Einrichtung, schöne Vorlagen, sofortiges Teilen.",
			launchKiosk: "Kiosk Starten",
			adminPanel: "Admin-Panel",
		},
		features: {
			title: "Alles Was Sie Brauchen",
			easyCapture: {
				title: "Einfache Aufnahme",
				description:
					"Große Touch-Steuerung, Countdown-Timer und sofortige Vorschau. Perfekt für Gäste jeden Alters.",
			},
			beautifulTemplates: {
				title: "Schöne Vorlagen",
				description:
					"Passen Sie mit Ihren eigenen Rahmen und Overlays an. Fügen Sie Bildunterschriften hinzu.",
			},
			instantSharing: {
				title: "Sofortiges Teilen",
				description:
					"Gäste erhalten einen QR-Code zum sofortigen Herunterladen und Teilen. Keine App erforderlich.",
			},
			easyExport: {
				title: "Einfacher Export",
				description: "Laden Sie alle Fotos als ZIP herunter. Perfekt für Alben und Erinnerungen.",
			},
		},
		howItWorks: {
			title: "So Funktioniert Es",
			step1: {
				title: "Einrichten",
				description: "Konfigurieren Sie Ihre Vorlagen und Einstellungen im Admin-Panel.",
			},
			step2: {
				title: "Aufnehmen",
				description: "Gäste tippen zum Starten, wählen eine Vorlage und machen ihr Foto.",
			},
			step3: {
				title: "Teilen",
				description: "Scannen Sie den QR-Code zum sofortigen Herunterladen und Teilen.",
			},
		},
		cta: {
			title: "Bereit Loszulegen?",
			subtitle: "Richten Sie Ihre Fotobox in Minuten ein. Keine Installation erforderlich.",
			button: "Kiosk Jetzt Starten",
		},
		footer: {
			tagline: "Photocall - Fotobox für Events",
			privacy: "Datenschutz",
			terms: "Nutzungsbedingungen",
		},
		pricing: {
			title: "Einfache Preise",
			free: {
				title: "Kostenlos",
				price: "0€",
				period: "für immer",
				features: ["1 kostenloses Event", "10 Fotos inklusive", "Grundvorlagen", "QR-Code-Teilen"],
			},
			paid: {
				title: "Pro Event",
				price: "49€",
				period: "pro Event",
				features: [
					"200 Fotos inklusive",
					"0,25€ pro zusätzliches Foto",
					"Eigenes Branding",
					"Ohne Wasserzeichen",
					"Prioritäts-Support",
					"Analytics-Dashboard",
				],
			},
		},
		eventTypes: {
			weddings: "Hochzeiten",
			parties: "Partys",
			corporate: "Firmenevents",
			birthdays: "Geburtstage",
			graduations: "Abschlussfeiern",
			celebrations: "Feiern",
		},
	},
	it: {
		metadata: {
			title: "Photocall - Photobooth per Eventi",
			description:
				"Photobooth moderno per matrimoni, feste, eventi aziendali e celebrazioni. Configurazione facile, modelli bellissimi, condivisione istantanea.",
			keywords:
				"photobooth, photobooth eventi, photobooth matrimonio, foto feste, eventi aziendali",
		},
		nav: { admin: "Admin", dashboard: "Dashboard", signIn: "Accedi", startKiosk: "Avvia Chiosco" },
		hero: {
			title: "Cattura Momenti",
			titleHighlight: "Indimenticabili",
			subtitle:
				"Photobooth moderno per matrimoni, feste ed eventi aziendali. Configurazione facile, modelli bellissimi, condivisione istantanea.",
			launchKiosk: "Avvia Chiosco",
			adminPanel: "Pannello Admin",
		},
		features: {
			title: "Tutto Ciò di Cui Hai Bisogno",
			easyCapture: {
				title: "Cattura Facile",
				description:
					"Grandi controlli touch, timer e anteprima istantanea. Perfetto per ospiti di tutte le età.",
			},
			beautifulTemplates: {
				title: "Bellissimi Modelli",
				description: "Personalizza con le tue cornici e sovrapposizioni. Aggiungi didascalie.",
			},
			instantSharing: {
				title: "Condivisione Istantanea",
				description:
					"Gli ospiti ricevono un codice QR per scaricare e condividere istantaneamente.",
			},
			easyExport: {
				title: "Esportazione Facile",
				description: "Scarica tutte le foto in ZIP. Perfetto per album e ricordi.",
			},
		},
		howItWorks: {
			title: "Come Funziona",
			step1: {
				title: "Configura",
				description: "Configura modelli e impostazioni nel pannello admin.",
			},
			step2: {
				title: "Cattura",
				description: "Gli ospiti toccano per iniziare, scelgono un modello e scattano.",
			},
			step3: {
				title: "Condividi",
				description: "Scansiona il codice QR per scaricare e condividere istantaneamente.",
			},
		},
		cta: {
			title: "Pronto per Iniziare?",
			subtitle: "Configura il tuo photobooth in pochi minuti. Nessuna installazione richiesta.",
			button: "Avvia Chiosco Ora",
		},
		footer: {
			tagline: "Photocall - Photobooth per Eventi",
			privacy: "Privacy Policy",
			terms: "Termini di Servizio",
		},
		pricing: {
			title: "Prezzi Semplici",
			free: {
				title: "Gratuito",
				price: "0€",
				period: "per sempre",
				features: ["1 evento gratuito", "10 foto incluse", "Modelli base", "Condivisione QR"],
			},
			paid: {
				title: "Per Evento",
				price: "49€",
				period: "per evento",
				features: [
					"200 foto incluse",
					"0,25€ per foto aggiuntiva",
					"Branding personalizzato",
					"Senza filigrana",
					"Supporto prioritario",
					"Dashboard analytics",
				],
			},
		},
		eventTypes: {
			weddings: "Matrimoni",
			parties: "Feste",
			corporate: "Eventi Aziendali",
			birthdays: "Compleanni",
			graduations: "Lauree",
			celebrations: "Celebrazioni",
		},
	},
	pt: {
		metadata: {
			title: "Photocall - Cabine Fotográfica para Eventos",
			description:
				"Cabine fotográfica moderna para casamentos, festas, eventos corporativos e celebrações. Configuração fácil, belos modelos, compartilhamento instantâneo.",
			keywords:
				"cabine fotográfica, cabine de eventos, cabine de casamento, fotos de festa, eventos corporativos",
		},
		nav: { admin: "Admin", dashboard: "Painel", signIn: "Entrar", startKiosk: "Iniciar Quiosque" },
		hero: {
			title: "Capture Momentos",
			titleHighlight: "Inesquecíveis",
			subtitle:
				"Cabine fotográfica moderna para casamentos, festas e eventos corporativos. Configuração fácil, belos modelos, compartilhamento instantâneo.",
			launchKiosk: "Iniciar Quiosque",
			adminPanel: "Painel Admin",
		},
		features: {
			title: "Tudo Que Você Precisa",
			easyCapture: {
				title: "Captura Fácil",
				description:
					"Controles touch grandes, temporizador e pré-visualização instantânea. Perfeito para convidados de todas as idades.",
			},
			beautifulTemplates: {
				title: "Belos Modelos",
				description: "Personalize com suas próprias molduras e sobreposições.",
			},
			instantSharing: {
				title: "Compartilhamento Instantâneo",
				description:
					"Os convidados recebem um código QR para baixar e compartilhar instantaneamente.",
			},
			easyExport: {
				title: "Exportação Fácil",
				description: "Baixe todas as fotos em ZIP. Perfeito para álbuns e memórias.",
			},
		},
		howItWorks: {
			title: "Como Funciona",
			step1: {
				title: "Configure",
				description: "Configure modelos e configurações no painel admin.",
			},
			step2: {
				title: "Capture",
				description: "Os convidados tocam para começar e tiram sua foto.",
			},
			step3: {
				title: "Compartilhe",
				description: "Escaneie o código QR para baixar e compartilhar.",
			},
		},
		cta: {
			title: "Pronto para Começar?",
			subtitle: "Configure sua cabine fotográfica em minutos. Nenhuma instalação necessária.",
			button: "Iniciar Quiosque Agora",
		},
		footer: {
			tagline: "Photocall - Cabine Fotográfica para Eventos",
			privacy: "Política de Privacidade",
			terms: "Termos de Serviço",
		},
		pricing: {
			title: "Preços Simples",
			free: {
				title: "Grátis",
				price: "R$0",
				period: "para sempre",
				features: [
					"1 evento grátis",
					"10 fotos incluídas",
					"Modelos básicos",
					"Compartilhamento QR",
				],
			},
			paid: {
				title: "Por Evento",
				price: "R$249",
				period: "por evento",
				features: [
					"200 fotos incluídas",
					"R$1,25 por foto adicional",
					"Marca personalizada",
					"Sem marca d'água",
					"Suporte prioritário",
					"Dashboard de análise",
				],
			},
		},
		eventTypes: {
			weddings: "Casamentos",
			parties: "Festas",
			corporate: "Eventos Corporativos",
			birthdays: "Aniversários",
			graduations: "Formaturas",
			celebrations: "Celebrações",
		},
	},
	nl: {
		metadata: {
			title: "Photocall - Fotohokje voor Evenementen",
			description:
				"Moderne fotohokje voor bruiloften, feesten, bedrijfsevenementen en vieringen. Eenvoudige setup, mooie sjablonen, direct delen.",
			keywords:
				"fotohokje, evenement fotohokje, bruiloft fotohokje, feestfoto's, bedrijfsevenementen",
		},
		nav: { admin: "Admin", dashboard: "Dashboard", signIn: "Inloggen", startKiosk: "Start Kiosk" },
		hero: {
			title: "Leg Onvergetelijke",
			titleHighlight: "Momenten Vast",
			subtitle:
				"Moderne fotohokje voor bruiloften, feesten en bedrijfsevenementen. Eenvoudige setup, mooie sjablonen, direct delen.",
			launchKiosk: "Start Kiosk",
			adminPanel: "Admin Paneel",
		},
		features: {
			title: "Alles Wat Je Nodig Hebt",
			easyCapture: {
				title: "Gemakkelijk Vastleggen",
				description:
					"Grote touchbediening, timer en directe preview. Perfect voor gasten van alle leeftijden.",
			},
			beautifulTemplates: {
				title: "Mooie Sjablonen",
				description: "Pas aan met eigen kaders en overlays.",
			},
			instantSharing: {
				title: "Direct Delen",
				description: "Gasten krijgen een QR-code om direct te downloaden.",
			},
			easyExport: {
				title: "Gemakkelijk Exporteren",
				description: "Download alle foto's als ZIP. Perfect voor albums en herinneringen.",
			},
		},
		howItWorks: {
			title: "Hoe Het Werkt",
			step1: {
				title: "Instellen",
				description: "Configureer sjablonen en instellingen in het admin paneel.",
			},
			step2: {
				title: "Vastleggen",
				description: "Gasten tikken om te beginnen en maken hun foto.",
			},
			step3: { title: "Delen", description: "Scan de QR-code om direct te downloaden en delen." },
		},
		cta: {
			title: "Klaar om te Beginnen?",
			subtitle: "Stel je fotohokje in binnen enkele minuten. Geen installatie vereist.",
			button: "Start Kiosk Nu",
		},
		footer: {
			tagline: "Photocall - Fotohokje voor Evenementen",
			privacy: "Privacybeleid",
			terms: "Servicevoorwaarden",
		},
		pricing: {
			title: "Eenvoudige Prijzen",
			free: {
				title: "Gratis",
				price: "€0",
				period: "voor altijd",
				features: ["1 gratis evenement", "10 foto's inbegrepen", "Basis sjablonen", "QR delen"],
			},
			paid: {
				title: "Per Evenement",
				price: "€49",
				period: "per evenement",
				features: [
					"200 foto's inbegrepen",
					"€0,25 per extra foto",
					"Eigen branding",
					"Zonder watermerk",
					"Prioriteitsondersteuning",
					"Analytics dashboard",
				],
			},
		},
		eventTypes: {
			weddings: "Bruiloften",
			parties: "Feesten",
			corporate: "Bedrijfsevenementen",
			birthdays: "Verjaardagen",
			graduations: "Diploma-uitreikingen",
			celebrations: "Vieringen",
		},
	},
	ru: {
		metadata: {
			title: "Photocall - Фотобудка для Мероприятий",
			description:
				"Современная фотобудка для свадеб, вечеринок, корпоративов и праздников. Простая настройка, красивые шаблоны, мгновенный обмен.",
			keywords:
				"фотобудка, фотобудка для мероприятий, свадебная фотобудка, фото вечеринки, корпоративы",
		},
		nav: { admin: "Админ", dashboard: "Панель", signIn: "Войти", startKiosk: "Запустить Киоск" },
		hero: {
			title: "Запечатлейте Незабываемые",
			titleHighlight: "Моменты",
			subtitle:
				"Современная фотобудка для свадеб, вечеринок и корпоративов. Простая настройка, красивые шаблоны, мгновенный обмен.",
			launchKiosk: "Запустить Киоск",
			adminPanel: "Админ Панель",
		},
		features: {
			title: "Всё Что Вам Нужно",
			easyCapture: {
				title: "Простая Съёмка",
				description:
					"Большие сенсорные кнопки, таймер и мгновенный предпросмотр. Подходит для гостей любого возраста.",
			},
			beautifulTemplates: {
				title: "Красивые Шаблоны",
				description: "Настройте свои рамки и накладки.",
			},
			instantSharing: {
				title: "Мгновенный Обмен",
				description: "Гости получают QR-код для мгновенной загрузки.",
			},
			easyExport: {
				title: "Простой Экспорт",
				description: "Скачайте все фото в ZIP архиве. Идеально для альбомов и воспоминаний.",
			},
		},
		howItWorks: {
			title: "Как Это Работает",
			step1: { title: "Настройка", description: "Настройте шаблоны и параметры в админ панели." },
			step2: { title: "Съёмка", description: "Гости нажимают чтобы начать и делают фото." },
			step3: { title: "Поделиться", description: "Отсканируйте QR-код для загрузки и обмена." },
		},
		cta: {
			title: "Готовы Начать?",
			subtitle: "Настройте фотобудку за минуты. Установка не требуется.",
			button: "Запустить Киоск Сейчас",
		},
		footer: {
			tagline: "Photocall - Фотобудка для Мероприятий",
			privacy: "Политика Конфиденциальности",
			terms: "Условия Использования",
		},
		pricing: {
			title: "Простые Цены",
			free: {
				title: "Бесплатно",
				price: "₽0",
				period: "навсегда",
				features: ["1 бесплатное мероприятие", "10 фото включено", "Базовые шаблоны", "QR обмен"],
			},
			paid: {
				title: "За Мероприятие",
				price: "₽4900",
				period: "за мероприятие",
				features: [
					"200 фото включено",
					"₽25 за дополнительное фото",
					"Свой бренд",
					"Без водяных знаков",
					"Приоритетная поддержка",
					"Аналитика",
				],
			},
		},
		eventTypes: {
			weddings: "Свадьбы",
			parties: "Вечеринки",
			corporate: "Корпоративы",
			birthdays: "Дни рождения",
			graduations: "Выпускные",
			celebrations: "Праздники",
		},
	},
	zh: {
		metadata: {
			title: "Photocall - 活动照相亭",
			description: "现代化的婚礼、派对、企业活动和庆典照相亭。简单设置，精美模板，即时分享。",
			keywords: "照相亭, 活动照相亭, 婚礼照相亭, 派对照片, 企业活动",
		},
		nav: { admin: "管理", dashboard: "仪表板", signIn: "登录", startKiosk: "启动自助终端" },
		hero: {
			title: "捕捉难忘",
			titleHighlight: "活动时刻",
			subtitle: "现代化的婚礼、派对和企业活动照相亭。简单设置，精美模板，即时分享。",
			launchKiosk: "启动自助终端",
			adminPanel: "管理面板",
		},
		features: {
			title: "您需要的一切",
			easyCapture: {
				title: "轻松拍摄",
				description: "大触控按钮，倒计时器和即时预览。适合所有年龄段的客人。",
			},
			beautifulTemplates: {
				title: "精美模板",
				description: "使用您自己的相框和叠加层进行自定义。",
			},
			instantSharing: { title: "即时分享", description: "客人获得二维码即时下载和分享。" },
			easyExport: {
				title: "轻松导出",
				description: "将所有照片下载为ZIP文件。完美适合相册和回忆。",
			},
		},
		howItWorks: {
			title: "如何使用",
			step1: { title: "设置", description: "在管理面板中配置模板和设置。" },
			step2: { title: "拍摄", description: "客人点击开始，选择模板并拍照。" },
			step3: { title: "分享", description: "扫描二维码即时下载和分享。" },
		},
		cta: {
			title: "准备开始了吗？",
			subtitle: "几分钟内设置您的照相亭。无需安装。",
			button: "立即启动",
		},
		footer: { tagline: "Photocall - 活动照相亭", privacy: "隐私政策", terms: "服务条款" },
		pricing: {
			title: "简单定价",
			free: {
				title: "免费",
				price: "¥0",
				period: "永久",
				features: ["1个免费活动", "10张照片", "基础模板", "二维码分享"],
			},
			paid: {
				title: "按活动付费",
				price: "¥349",
				period: "每活动",
				features: ["200张照片", "¥1.75/额外照片", "自定义品牌", "无水印", "优先支持", "分析仪表板"],
			},
		},
		eventTypes: {
			weddings: "婚礼",
			parties: "派对",
			corporate: "企业活动",
			birthdays: "生日",
			graduations: "毕业典礼",
			celebrations: "庆典",
		},
	},
	ja: {
		metadata: {
			title: "Photocall - イベントフォトブース",
			description:
				"結婚式、パーティー、企業イベント、お祝い向けのモダンなフォトブース。簡単セットアップ、美しいテンプレート、即時共有。",
			keywords:
				"フォトブース, イベントフォトブース, ウェディングフォトブース, パーティー写真, 企業イベント",
		},
		nav: {
			admin: "管理",
			dashboard: "ダッシュボード",
			signIn: "サインイン",
			startKiosk: "キオスクを開始",
		},
		hero: {
			title: "忘れられない",
			titleHighlight: "イベントの瞬間を",
			subtitle:
				"結婚式、パーティー、企業イベント向けのモダンなフォトブース。簡単セットアップ、美しいテンプレート、即時共有。",
			launchKiosk: "キオスクを起動",
			adminPanel: "管理パネル",
		},
		features: {
			title: "必要なものすべて",
			easyCapture: {
				title: "簡単撮影",
				description:
					"大きなタッチコントロール、カウントダウン、即時プレビュー。全年齢のゲストに最適。",
			},
			beautifulTemplates: {
				title: "美しいテンプレート",
				description: "独自のフレームとオーバーレイでカスタマイズ。",
			},
			instantSharing: {
				title: "即時共有",
				description: "ゲストはQRコードで即座にダウンロード・共有できます。",
			},
			easyExport: {
				title: "簡単エクスポート",
				description: "すべての写真をZIPでダウンロード。アルバムや思い出に最適。",
			},
		},
		howItWorks: {
			title: "使い方",
			step1: { title: "セットアップ", description: "管理パネルでテンプレートと設定を構成。" },
			step2: { title: "撮影", description: "ゲストがタップして開始、テンプレートを選んで撮影。" },
			step3: { title: "共有", description: "QRコードをスキャンして即座にダウンロード・共有。" },
		},
		cta: {
			title: "始める準備はできましたか？",
			subtitle: "数分でフォトブースをセットアップ。インストール不要。",
			button: "今すぐキオスクを起動",
		},
		footer: {
			tagline: "Photocall - イベントフォトブース",
			privacy: "プライバシーポリシー",
			terms: "利用規約",
		},
		pricing: {
			title: "シンプルな料金",
			free: {
				title: "無料",
				price: "¥0",
				period: "永久",
				features: ["1イベント無料", "10枚の写真込み", "基本テンプレート", "QR共有"],
			},
			paid: {
				title: "イベントごと",
				price: "¥7,500",
				period: "イベントごと",
				features: [
					"200枚の写真込み",
					"¥40/追加写真",
					"カスタムブランド",
					"透かしなし",
					"優先サポート",
					"分析ダッシュボード",
				],
			},
		},
		eventTypes: {
			weddings: "結婚式",
			parties: "パーティー",
			corporate: "企業イベント",
			birthdays: "誕生日",
			graduations: "卒業式",
			celebrations: "お祝い",
		},
	},
	ko: {
		metadata: {
			title: "Photocall - 이벤트 포토부스",
			description:
				"결혼식, 파티, 기업 이벤트, 축하 행사를 위한 현대적인 포토부스. 쉬운 설정, 아름다운 템플릿, 즉시 공유.",
			keywords: "포토부스, 이벤트 포토부스, 웨딩 포토부스, 파티 사진, 기업 이벤트",
		},
		nav: { admin: "관리자", dashboard: "대시보드", signIn: "로그인", startKiosk: "키오스크 시작" },
		hero: {
			title: "잊지 못할",
			titleHighlight: "이벤트 순간을",
			subtitle:
				"결혼식, 파티, 기업 이벤트를 위한 현대적인 포토부스. 쉬운 설정, 아름다운 템플릿, 즉시 공유.",
			launchKiosk: "키오스크 시작",
			adminPanel: "관리자 패널",
		},
		features: {
			title: "필요한 모든 것",
			easyCapture: {
				title: "쉬운 촬영",
				description:
					"큰 터치 컨트롤, 카운트다운 타이머, 즉시 미리보기. 모든 연령대의 손님에게 적합.",
			},
			beautifulTemplates: {
				title: "아름다운 템플릿",
				description: "자신만의 프레임과 오버레이로 커스터마이즈.",
			},
			instantSharing: {
				title: "즉시 공유",
				description: "손님들이 QR 코드로 즉시 다운로드하고 공유.",
			},
			easyExport: {
				title: "쉬운 내보내기",
				description: "모든 사진을 ZIP으로 다운로드. 앨범과 추억에 완벽.",
			},
		},
		howItWorks: {
			title: "사용 방법",
			step1: { title: "설정", description: "관리자 패널에서 템플릿과 설정을 구성." },
			step2: { title: "촬영", description: "손님이 탭하여 시작하고 템플릿을 선택하여 사진 촬영." },
			step3: { title: "공유", description: "QR 코드를 스캔하여 즉시 다운로드 및 공유." },
		},
		cta: {
			title: "시작할 준비가 되셨나요?",
			subtitle: "몇 분 안에 포토부스를 설정하세요. 설치 필요 없음.",
			button: "지금 키오스크 시작",
		},
		footer: {
			tagline: "Photocall - 이벤트 포토부스",
			privacy: "개인정보 처리방침",
			terms: "이용약관",
		},
		pricing: {
			title: "간단한 가격",
			free: {
				title: "무료",
				price: "₩0",
				period: "영구",
				features: ["1개 무료 이벤트", "10장 포함", "기본 템플릿", "QR 공유"],
			},
			paid: {
				title: "이벤트당",
				price: "₩65,000",
				period: "이벤트당",
				features: [
					"200장 포함",
					"₩350/추가 사진",
					"맞춤 브랜딩",
					"워터마크 없음",
					"우선 지원",
					"분석 대시보드",
				],
			},
		},
		eventTypes: {
			weddings: "결혼식",
			parties: "파티",
			corporate: "기업 이벤트",
			birthdays: "생일",
			graduations: "졸업식",
			celebrations: "축하 행사",
		},
	},
	ar: {
		metadata: {
			title: "Photocall - كشك صور المناسبات",
			description:
				"كشك صور حديث لحفلات الزفاف والحفلات وفعاليات الشركات والاحتفالات. إعداد سهل، قوالب جميلة، مشاركة فورية.",
			keywords: "كشك صور, كشك صور مناسبات, كشك صور زفاف, صور حفلات, فعاليات الشركات",
		},
		nav: {
			admin: "الإدارة",
			dashboard: "لوحة التحكم",
			signIn: "تسجيل الدخول",
			startKiosk: "بدء الكيوسك",
		},
		hero: {
			title: "التقط لحظات",
			titleHighlight: "لا تُنسى",
			subtitle:
				"كشك صور حديث لحفلات الزفاف والحفلات وفعاليات الشركات. إعداد سهل، قوالب جميلة، مشاركة فورية.",
			launchKiosk: "تشغيل الكيوسك",
			adminPanel: "لوحة الإدارة",
		},
		features: {
			title: "كل ما تحتاجه",
			easyCapture: {
				title: "التقاط سهل",
				description: "أزرار لمس كبيرة، مؤقت عد تنازلي ومعاينة فورية. مثالي للضيوف من جميع الأعمار.",
			},
			beautifulTemplates: { title: "قوالب جميلة", description: "خصص بإطاراتك وطبقاتك الخاصة." },
			instantSharing: {
				title: "مشاركة فورية",
				description: "يحصل الضيوف على رمز QR للتحميل والمشاركة الفورية.",
			},
			easyExport: {
				title: "تصدير سهل",
				description: "حمل جميع الصور كملف ZIP. مثالي للألبومات والذكريات.",
			},
		},
		howItWorks: {
			title: "كيف يعمل",
			step1: { title: "الإعداد", description: "قم بتكوين القوالب والإعدادات في لوحة الإدارة." },
			step2: {
				title: "الالتقاط",
				description: "ينقر الضيوف للبدء، يختارون قالبًا ويلتقطون صورتهم.",
			},
			step3: { title: "المشاركة", description: "امسح رمز QR للتحميل والمشاركة فورًا." },
		},
		cta: {
			title: "مستعد للبدء؟",
			subtitle: "قم بإعداد كشك الصور في دقائق. لا حاجة للتثبيت.",
			button: "تشغيل الكيوسك الآن",
		},
		footer: {
			tagline: "Photocall - كشك صور المناسبات",
			privacy: "سياسة الخصوصية",
			terms: "شروط الخدمة",
		},
		pricing: {
			title: "أسعار بسيطة",
			free: {
				title: "مجاني",
				price: "$0",
				period: "للأبد",
				features: ["حدث واحد مجاني", "10 صور مشمولة", "قوالب أساسية", "مشاركة QR"],
			},
			paid: {
				title: "لكل حدث",
				price: "$49",
				period: "لكل حدث",
				features: [
					"200 صورة مشمولة",
					"$0.25/صورة إضافية",
					"علامة تجارية مخصصة",
					"بدون علامة مائية",
					"دعم أولوي",
					"لوحة تحليلات",
				],
			},
		},
		eventTypes: {
			weddings: "حفلات الزفاف",
			parties: "الحفلات",
			corporate: "فعاليات الشركات",
			birthdays: "أعياد الميلاد",
			graduations: "التخرج",
			celebrations: "الاحتفالات",
		},
	},
};

// Languages that will use English as base with locale-specific metadata
const otherLanguages: Record<string, { name: string; localizedTitle: string }> = {
	hi: { name: "Hindi", localizedTitle: "Photocall - इवेंट फोटो बूथ" },
	tr: { name: "Turkish", localizedTitle: "Photocall - Etkinlik Fotoğraf Kabini" },
	pl: { name: "Polish", localizedTitle: "Photocall - Fotobudka na Imprezy" },
	sv: { name: "Swedish", localizedTitle: "Photocall - Fotobås för Evenemang" },
	da: { name: "Danish", localizedTitle: "Photocall - Fotoboks til Events" },
	no: { name: "Norwegian", localizedTitle: "Photocall - Fotoboks for Arrangementer" },
	fi: { name: "Finnish", localizedTitle: "Photocall - Valokuvakoppi Tapahtumiin" },
	el: { name: "Greek", localizedTitle: "Photocall - Φωτογραφικός Θάλαμος Εκδηλώσεων" },
	cs: { name: "Czech", localizedTitle: "Photocall - Fotobudka na Akce" },
	hu: { name: "Hungarian", localizedTitle: "Photocall - Esemény Fotófülke" },
	ro: { name: "Romanian", localizedTitle: "Photocall - Cabină Foto pentru Evenimente" },
	bg: { name: "Bulgarian", localizedTitle: "Photocall - Фотобудка за Събития" },
	uk: { name: "Ukrainian", localizedTitle: "Photocall - Фотобудка для Подій" },
	vi: { name: "Vietnamese", localizedTitle: "Photocall - Gian Ảnh Sự Kiện" },
	th: { name: "Thai", localizedTitle: "Photocall - ตู้ถ่ายรูปงานอีเวนต์" },
	id: { name: "Indonesian", localizedTitle: "Photocall - Photo Booth untuk Acara" },
	ms: { name: "Malay", localizedTitle: "Photocall - Gerai Foto untuk Acara" },
	tl: { name: "Filipino", localizedTitle: "Photocall - Photo Booth para sa mga Event" },
	he: { name: "Hebrew", localizedTitle: "Photocall - תא צילום לאירועים" },
	fa: { name: "Persian", localizedTitle: "Photocall - غرفه عکس رویداد" },
	bn: { name: "Bengali", localizedTitle: "Photocall - ইভেন্ট ফটো বুথ" },
	ta: { name: "Tamil", localizedTitle: "Photocall - நிகழ்வு புகைப்பட அறை" },
	te: { name: "Telugu", localizedTitle: "Photocall - ఈవెంట్ ఫోటో బూత్" },
	mr: { name: "Marathi", localizedTitle: "Photocall - इव्हेंट फोटो बूथ" },
	pa: { name: "Punjabi", localizedTitle: "Photocall - ਇਵੈਂਟ ਫੋਟੋ ਬੂਥ" },
	ur: { name: "Urdu", localizedTitle: "Photocall - ایونٹ فوٹو بوتھ" },
	sw: { name: "Swahili", localizedTitle: "Photocall - Kibanda cha Picha za Hafla" },
	hr: { name: "Croatian", localizedTitle: "Photocall - Foto Kiosk za Događaje" },
	sk: { name: "Slovak", localizedTitle: "Photocall - Fotobúdka na Udalosti" },
	sl: { name: "Slovenian", localizedTitle: "Photocall - Foto Kabina za Dogodke" },
	et: { name: "Estonian", localizedTitle: "Photocall - Ürituste Fotokiosk" },
	lv: { name: "Latvian", localizedTitle: "Photocall - Pasākumu Foto Kiosks" },
	lt: { name: "Lithuanian", localizedTitle: "Photocall - Renginių Foto Kioskas" },
};

// Load English base
const enPath = path.join(__dirname, "../i18n/messages/en.json");
const enBase = JSON.parse(fs.readFileSync(enPath, "utf-8"));

// Generate all translations
const messagesDir = path.join(__dirname, "../i18n/messages");

// Ensure directory exists
if (!fs.existsSync(messagesDir)) {
	fs.mkdirSync(messagesDir, { recursive: true });
}

// Write detailed translations
for (const [locale, content] of Object.entries(translations)) {
	const filePath = path.join(messagesDir, `${locale}.json`);
	fs.writeFileSync(filePath, JSON.stringify(content, null, "\t"));
	console.log(`Generated ${locale}.json`);
}

// Generate other languages based on English with localized metadata
for (const [locale, info] of Object.entries(otherLanguages)) {
	const filePath = path.join(messagesDir, `${locale}.json`);
	const content = {
		...enBase,
		metadata: {
			...enBase.metadata,
			title: info.localizedTitle,
		},
	};
	fs.writeFileSync(filePath, JSON.stringify(content, null, "\t"));
	console.log(`Generated ${locale}.json (based on English)`);
}

console.log("\nAll translation files generated!");
