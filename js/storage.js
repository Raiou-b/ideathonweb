/**
 * storage.js - Local storage data persistence layer
 */
const Storage = (() => {
  const KEYS = {
    IDEATHONS: 'ideathonweb_ideathons',
    IDEAS: 'ideathonweb_ideas',
    VOTES: 'ideathonweb_votes',
  };

  function getJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ── Ideathons ──────────────────────────────────────────
  function getIdeathons() {
    return getJSON(KEYS.IDEATHONS) || [];
  }

  function saveIdeathon(ideathon) {
    const list = getIdeathons();
    const idx = list.findIndex(i => i.id === ideathon.id);
    if (idx >= 0) {
      list[idx] = ideathon;
    } else {
      list.unshift(ideathon);
    }
    setJSON(KEYS.IDEATHONS, list);
    return ideathon;
  }

  function deleteIdeathon(id) {
    const list = getIdeathons().filter(i => i.id !== id);
    setJSON(KEYS.IDEATHONS, list);
    // Also remove associated ideas
    const ideas = getIdeas().filter(i => i.ideathonId !== id);
    setJSON(KEYS.IDEAS, ideas);
  }

  function getIdeathonById(id) {
    return getIdeathons().find(i => i.id === id) || null;
  }

  // ── Ideas ──────────────────────────────────────────────
  function getIdeas(ideathonId) {
    const all = getJSON(KEYS.IDEAS) || [];
    if (ideathonId) return all.filter(i => i.ideathonId === ideathonId);
    return all;
  }

  function saveIdea(idea) {
    const list = getJSON(KEYS.IDEAS) || [];
    const idx = list.findIndex(i => i.id === idea.id);
    if (idx >= 0) {
      list[idx] = idea;
    } else {
      list.unshift(idea);
    }
    setJSON(KEYS.IDEAS, list);
    return idea;
  }

  function deleteIdea(id) {
    const list = (getJSON(KEYS.IDEAS) || []).filter(i => i.id !== id);
    setJSON(KEYS.IDEAS, list);
  }

  function getIdeaById(id) {
    return (getJSON(KEYS.IDEAS) || []).find(i => i.id === id) || null;
  }

  // ── Votes ──────────────────────────────────────────────
  function getVotes() {
    return getJSON(KEYS.VOTES) || {};
  }

  function toggleVote(ideaId) {
    const votes = getVotes();
    if (votes[ideaId]) {
      delete votes[ideaId];
      setJSON(KEYS.VOTES, votes);
      return false;
    } else {
      votes[ideaId] = true;
      setJSON(KEYS.VOTES, votes);
      return true;
    }
  }

  function hasVoted(ideaId) {
    return !!(getVotes()[ideaId]);
  }

  // ── Seed demo data if empty ────────────────────────────
  function seedDemoData() {
    if (getIdeathons().length > 0) return;

    const demoIdeathons = [
      {
        id: 'ideathon-demo-1',
        title: 'スマートシティ・アイデアソン 2025',
        date: '2025-06-15',
        endDate: '2025-06-16',
        participants: '大学生・社会人',
        category: 'technology',
        description: '未来のスマートシティを実現するための革新的なアイデアを生み出すアイデアソンです。テクノロジーを活用した都市課題解決策を募集します。',
        tags: ['スマートシティ', 'IoT', 'AI'],
        status: 'upcoming',
        maxParticipants: 50,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'ideathon-demo-2',
        title: 'サステナビリティ・チャレンジ',
        date: '2025-05-20',
        endDate: '2025-05-20',
        participants: '全年齢対象',
        category: 'environment',
        description: '環境問題に対する持続可能なソリューションを考えるワークショップ型アイデアソンです。SDGsの目標達成に向けたアイデアを歓迎します。',
        tags: ['SDGs', '環境', 'サステナブル'],
        status: 'active',
        maxParticipants: 30,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        id: 'ideathon-demo-3',
        title: '地域活性化アイデアソン',
        date: '2025-04-10',
        endDate: '2025-04-10',
        participants: '地域住民・学生',
        category: 'community',
        description: '地域の課題を解決し、魅力ある街づくりに貢献するアイデアを募集します。地元の人々が集い、共に考えるイベントです。',
        tags: ['地域活性化', 'コミュニティ', '街づくり'],
        status: 'completed',
        maxParticipants: 40,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
    ];

    const demoIdeas = [
      {
        id: 'idea-demo-1',
        ideathonId: 'ideathon-demo-1',
        title: 'AIを活用したゴミ分別システム',
        description: 'カメラとAIを組み合わせ、家庭ゴミを自動分別するスマートゴミ箱の開発。ゴミの分別率を向上させ、リサイクル促進につなげる。',
        status: 'prototype',
        progress: 65,
        votes: 12,
        tags: ['AI', 'リサイクル', 'IoT'],
        author: '田中チーム',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'idea-demo-2',
        ideathonId: 'ideathon-demo-1',
        title: 'コミュニティ防災ネットワーク',
        description: '近隣住民をつなぐ防災コミュニケーションアプリ。災害時の安否確認や物資共有、避難情報の共有をスムーズに行うプラットフォーム。',
        status: 'planning',
        progress: 30,
        votes: 8,
        tags: ['防災', 'コミュニティ', 'アプリ'],
        author: '鈴木チーム',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'idea-demo-3',
        ideathonId: 'ideathon-demo-2',
        title: 'フードロス削減マーケットプレイス',
        description: '飲食店や農家の余剰食材をリアルタイムで消費者につなぐプラットフォーム。食品廃棄物を削減しながら、低価格で質の高い食材を提供。',
        status: 'development',
        progress: 80,
        votes: 20,
        tags: ['フードロス', '食品', 'マーケット'],
        author: '山田チーム',
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'idea-demo-4',
        ideathonId: 'ideathon-demo-3',
        title: '観光客向けローカル体験プラットフォーム',
        description: '地域の職人や農家が観光客に体験プログラムを提供できるマッチングサービス。地域経済の活性化と文化の継承を同時に実現する。',
        status: 'completed',
        progress: 100,
        votes: 25,
        tags: ['観光', '体験', 'マッチング'],
        author: '佐藤チーム',
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ];

    demoIdeathons.forEach(i => saveIdeathon(i));
    demoIdeas.forEach(i => saveIdea(i));
  }

  return {
    getIdeathons,
    saveIdeathon,
    deleteIdeathon,
    getIdeathonById,
    getIdeas,
    saveIdea,
    deleteIdea,
    getIdeaById,
    toggleVote,
    hasVoted,
    seedDemoData,
  };
})();
