export type DialogueNpcId =
  | 'oni'
  | 'ghostQueen'
  | 'neonFat'
  | 'lira'
  | 'hana'
  | 'karina';

export type DialogueEffect =
  | { kind: 'storyFlagSet'; key: string; value: boolean }
  | { kind: 'storyAddKarma'; delta: number }
  | { kind: 'storyJoinFaction'; faction: string | null }
  | { kind: 'npcAddReputation'; npcId: DialogueNpcId; delta: number }
  | { kind: 'creditAdd'; delta: number }
  | { kind: 'creditSpend'; amount: number }
  | { kind: 'skillAdd'; skillName: string }
  | { kind: 'healToFull' }
  | { kind: 'questStart'; questId: string };

export type DialogueCondition =
  | { kind: 'hasSkill'; skillName: string }
  | { kind: 'notHasSkill'; skillName: string }
  | { kind: 'minCredit'; amount: number }
  | { kind: 'minKarma'; value: number }
  | { kind: 'maxKarma'; value: number }
  | { kind: 'storyFlag'; key: string; value: boolean }
  | { kind: 'storyJoinedFactionIs'; faction: string | null };

export type DialogueChoice = {
  id: string;
  text: string;
  nextNodeId?: string | null;
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
  /** 선택 직후에 추가로 출력할 문구(노드 텍스트와 별개) */
  resultText?: string;
};

export type DialogueNode = {
  id: string;
  text: string;
  choices?: DialogueChoice[];
};

export type DialogueTree = {
  npcId: DialogueNpcId;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
};

/**
 * 대화 트리(분기) 데이터
 * - WHY: App.tsx에 if/else로 분기를 쌓으면 유지보수가 어려워져서,
 *        대화를 데이터로 정의하고 엔진이 공통 처리하도록 만든다.
 */
export const DIALOGUE_TREES: Partial<Record<DialogueNpcId, DialogueTree>> = {
  oni: {
    npcId: 'oni',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: '쿠로사키 오니: “흐음… 제로 코드를 들고 있나? 선택해.”',
        choices: [
          {
            id: 'giveCode',
            text: '제로 코드 정보를 넘긴다. (카르마 -10 / 레드 드래곤 가입)',
            effects: [
              { kind: 'storyAddKarma', delta: -10 },
              { kind: 'storyJoinFaction', faction: '레드 드래곤' },
              { kind: 'npcAddReputation', npcId: 'oni', delta: 10 },
            ],
            resultText: '쿠로사키 오니: “현명한 선택이다.” 🔴 세력 가입!',
            nextNodeId: null,
          },
          {
            id: 'join',
            text: '레드 드래곤에 가입한다.',
            effects: [
              { kind: 'storyJoinFaction', faction: '레드 드래곤' },
              { kind: 'npcAddReputation', npcId: 'oni', delta: 5 },
            ],
            resultText: '쿠로사키 오니: “좋아. 레드 드래곤이 널 지켜주지.”',
            nextNodeId: null,
          },
        ],
      },
    },
  },

  ghostQueen: {
    npcId: 'ghostQueen',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: '고스트 퀸: “데이터의 자유를 원해? 네 선택을 보여줘.”',
        choices: [
          {
            id: 'join',
            text: '프리덤 네트워크에 가입한다.',
            effects: [
              { kind: 'storyJoinFaction', faction: '프리덤 네트워크' },
              { kind: 'npcAddReputation', npcId: 'ghostQueen', delta: 8 },
            ],
            resultText: '고스트 퀸: “환영해…”',
            nextNodeId: null,
          },
          {
            id: 'romance',
            text: '“로맨스 루트”에 관심을 보인다. (호감도 70 필요)',
            resultText: '고스트 퀸: “나랑 데이트하고 싶어? 그 전에 실력을 증명해.” (호감도 70 필요)',
            nextNodeId: null,
          },
          { id: 'teach_fireball', text: '마법전수: 파이어볼 (3000 COIN)', nextNodeId: 'teach_fireball' },
          { id: 'teach_lb', text: '마법전수: 라이트닝 볼트 (2400 COIN)', nextNodeId: 'teach_lb' },
          { id: 'teach_chain', text: '마법전수: 체인 라이트닝 (4500 COIN)', nextNodeId: 'teach_chain' },
          { id: 'teach_heal', text: '마법전수: 힐 (4500 COIN)', nextNodeId: 'teach_heal' },
        ],
      },
      teach_fireball: {
        id: 'teach_fireball',
        text: '고스트 퀸: “불꽃 코드를 이식할까?”',
        choices: [
          {
            id: 'already',
            text: '이미 파이어볼을 배웠다.',
            conditions: [{ kind: 'hasSkill', skillName: '파이어볼' }],
            resultText: '고스트 퀸: “넌 이미 그 뜨거운 코드를 품고 있잖아.”',
            nextNodeId: null,
          },
          {
            id: 'buy',
            text: '전수 받는다. (3000 COIN)',
            conditions: [{ kind: 'notHasSkill', skillName: '파이어볼' }, { kind: 'minCredit', amount: 3000 }],
            effects: [
              { kind: 'creditSpend', amount: 3000 },
              { kind: 'skillAdd', skillName: '파이어볼' },
              { kind: 'npcAddReputation', npcId: 'ghostQueen', delta: 3 },
            ],
            resultText: '고스트 퀸: “이 코드가 모든 걸 태워버릴 거야.” (파이어볼 습득)',
            nextNodeId: null,
          },
          {
            id: 'noMoney',
            text: '전수 받는다. (3000 COIN)',
            conditions: [{ kind: 'notHasSkill', skillName: '파이어볼' }],
            resultText: '고스트 퀸: “전송 비용이 부족해. 3000 COIN이 필요해.”',
            nextNodeId: 'start',
          },
          { id: 'back', text: '뒤로', nextNodeId: 'start' },
        ],
      },
      teach_lb: {
        id: 'teach_lb',
        text: '고스트 퀸: “번개의 창을 내려줄까?”',
        choices: [
          {
            id: 'already',
            text: '이미 라이트닝 볼트를 배웠다.',
            conditions: [{ kind: 'hasSkill', skillName: '라이트닝 볼트' }],
            resultText: '고스트 퀸: “가장 완벽한 타격점은 이미 네 머리 속에 있어.”',
            nextNodeId: null,
          },
          {
            id: 'buy',
            text: '전수 받는다. (2400 COIN)',
            conditions: [{ kind: 'notHasSkill', skillName: '라이트닝 볼트' }, { kind: 'minCredit', amount: 2400 }],
            effects: [
              { kind: 'creditSpend', amount: 2400 },
              { kind: 'skillAdd', skillName: '라이트닝 볼트' },
              { kind: 'npcAddReputation', npcId: 'ghostQueen', delta: 2 },
            ],
            resultText: '고스트 퀸: “번개의 창을 내려주지.” (라이트닝 볼트 습득)',
            nextNodeId: null,
          },
          {
            id: 'noMoney',
            text: '전수 받는다. (2400 COIN)',
            conditions: [{ kind: 'notHasSkill', skillName: '라이트닝 볼트' }],
            resultText: '고스트 퀸: “데이터 파편이 모자라. 2400 COIN 가져와.”',
            nextNodeId: 'start',
          },
          { id: 'back', text: '뒤로', nextNodeId: 'start' },
        ],
      },
      teach_chain: {
        id: 'teach_chain',
        text: '고스트 퀸: “연쇄 폭파 코드를 원해?”',
        choices: [
          {
            id: 'already',
            text: '이미 체인 라이트닝을 배웠다.',
            conditions: [{ kind: 'hasSkill', skillName: '체인 라이트닝' }],
            resultText: '고스트 퀸: “이미 연쇄 폭파 코드가 내장되어 있잖아.”',
            nextNodeId: null,
          },
          {
            id: 'buy',
            text: '전수 받는다. (4500 COIN)',
            conditions: [{ kind: 'notHasSkill', skillName: '체인 라이트닝' }, { kind: 'minCredit', amount: 4500 }],
            effects: [
              { kind: 'creditSpend', amount: 4500 },
              { kind: 'skillAdd', skillName: '체인 라이트닝' },
              { kind: 'npcAddReputation', npcId: 'ghostQueen', delta: 2 },
            ],
            resultText: '고스트 퀸: “여러 마리의 벌레를 한 번에 태우기에 딱 좋지.” (체인 라이트닝 습득)',
            nextNodeId: null,
          },
          {
            id: 'noMoney',
            text: '전수 받는다. (4500 COIN)',
            conditions: [{ kind: 'notHasSkill', skillName: '체인 라이트닝' }],
            resultText: '고스트 퀸: “이건 고급 연산이야. 4500 COIN이 필요해.”',
            nextNodeId: 'start',
          },
          { id: 'back', text: '뒤로', nextNodeId: 'start' },
        ],
      },
      teach_heal: {
        id: 'teach_heal',
        text: '고스트 퀸: “자기 복구 프로토콜을 줄까?”',
        choices: [
          {
            id: 'already',
            text: '이미 힐을 배웠다.',
            conditions: [{ kind: 'hasSkill', skillName: '힐' }],
            resultText: '고스트 퀸: “스스로를 복구하는 프로토콜은 이미 있잖아.”',
            nextNodeId: null,
          },
          {
            id: 'buy',
            text: '전수 받는다. (4500 COIN)',
            conditions: [{ kind: 'notHasSkill', skillName: '힐' }, { kind: 'minCredit', amount: 4500 }],
            effects: [
              { kind: 'creditSpend', amount: 4500 },
              { kind: 'skillAdd', skillName: '힐' },
              { kind: 'npcAddReputation', npcId: 'ghostQueen', delta: 2 },
            ],
            resultText: '고스트 퀸: “이 따뜻한 에너지가 널 보호하길.” (힐 습득)',
            nextNodeId: null,
          },
          {
            id: 'noMoney',
            text: '전수 받는다. (4500 COIN)',
            conditions: [{ kind: 'notHasSkill', skillName: '힐' }],
            resultText: '고스트 퀸: “회복 모듈은 비싸. 4500 COIN짜리야.”',
            nextNodeId: 'start',
          },
          { id: 'back', text: '뒤로', nextNodeId: 'start' },
        ],
      },
    },
  },

  lira: {
    npcId: 'lira',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: '리라: “여긴 선불이야. 누울 거면 누워.”',
        choices: [
          {
            id: 'heal',
            text: '치료 받는다. (HP 완전 회복)',
            effects: [
              { kind: 'healToFull' },
              { kind: 'npcAddReputation', npcId: 'lira', delta: 2 },
            ],
            resultText: '리라: “치료 끝. 다시 흉한 꼴로 오지 마라.” (HP가 가득 회복되었습니다)',
            nextNodeId: null,
          },
        ],
      },
    },
  },

  // 샘플 분기(요청: 최소 1개 NPC 예시) — 하나
  hana: {
    npcId: 'hana',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: '하나: “여긴 쉬어도 돼. 하지만 네온은 거짓말을 잘하지.”',
        choices: [
          {
            id: 'trust',
            text: '하나를 믿고 정보 제공을 요청한다.',
            conditions: [{ kind: 'minKarma', value: 0 }],
            effects: [
              { kind: 'npcAddReputation', npcId: 'hana', delta: 6 },
              { kind: 'storyFlagSet', key: 'hana_trusted', value: true },
            ],
            resultText: '하나: “좋아. 대신 네 발자국 냄새를 지우는 법부터 배워.” (호감도 +)',
            nextNodeId: null,
          },
          {
            id: 'doubt',
            text: '의심하며 거리를 둔다. (카르마 +1)',
            effects: [
              { kind: 'npcAddReputation', npcId: 'hana', delta: -2 },
              { kind: 'storyAddKarma', delta: 1 },
              { kind: 'storyFlagSet', key: 'hana_doubted', value: true },
            ],
            resultText: '하나: “그래. 의심은 생존이지.”',
            nextNodeId: null,
          },
          {
            id: 'threat',
            text: '협박하며 정보를 요구한다. (카르마 -2)',
            conditions: [{ kind: 'maxKarma', value: -1 }],
            effects: [
              { kind: 'npcAddReputation', npcId: 'hana', delta: -6 },
              { kind: 'storyAddKarma', delta: -2 },
              { kind: 'storyFlagSet', key: 'hana_threatened', value: true },
            ],
            resultText: '하나: “그 눈빛… 네온 아래에서 많이 봤어. 다음엔 널 돕지 않을 거야.”',
            nextNodeId: null,
          },
        ],
      },
    },
  },

  // 샘플 분기 — 카리나
  karina: {
    npcId: 'karina',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: '카리나: “정보는 무기야. 너, 어떤 값을 치를래?”',
        choices: [
          {
            id: 'deal',
            text: '거래를 제안한다. (호감도 + · 슬럼/상인 관련 정보)',
            effects: [
              { kind: 'npcAddReputation', npcId: 'karina', delta: 5 },
              { kind: 'storyFlagSet', key: 'karina_deal', value: true },
            ],
            resultText:
              '카리나: “좋아. 내 지문은 남기지 마.”\n\n' +
              '📎 [들은 정보 — 믿을지는 네 몫이야]\n' +
              '· 슬럼 심층 쪽에 철문 하나가 있다더라. 옆 패널은 네 칸 입력이고, 바닥에 떨어진 광고 전단에 「NEON REQUIEM — since 2087」만 읽힌다는 소문이 돌아. 숫자 힌트는 그 문구에서 직접 떠올려야 한대.\n' +
              '· 아이언 잭이 감정해 주는 장비랑, 베일 크립트 블라인드에서 나오는 각인은 **완전히 다른 풀**이래. 잭은 “확실한 강화”, 베일은 “도박 각인” 쪽이야.\n' +
              '· 마레콥 순찰 드론은 **정각·30분 근처**에 메인 루트를 도는 패턴이 잡혀 있다더라. 급할 땐 그 사이를 비집고 가.\n' +
              '· 레드 드래곤 러너들은 크레딧보다 **로그에 남는 서약**을 더 중시한다는 말이 있어. 서명 전에 두 번 봐.\n\n' +
              '(기록: story.karina_deal · 카리나 호감도 +5)',
            nextNodeId: null,
          },
          {
            id: 'refuse',
            text: '거절한다.',
            effects: [
              { kind: 'npcAddReputation', npcId: 'karina', delta: -1 },
              { kind: 'storyFlagSet', key: 'karina_refused', value: true },
            ],
            resultText: '카리나: “언제든 돌아와. 가격은 오르겠지만.”',
            nextNodeId: null,
          },
        ],
      },
    },
  },
};

