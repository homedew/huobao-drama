<template>
  <div class="settings-page">
    <h1 class="page-title">{{ t('settings.pageTitle') }}</h1>
    <div class="settings-layout">
      <aside class="settings-nav">
        <div class="nav-group">
          <div class="nav-group-label">{{ t('settings.nav.basic') }}</div>
          <button v-for="bt in baseTabs" :key="bt.id" :class="['nav-item', { active: tab === bt.id }]" @click="tab = bt.id">
            <component :is="bt.icon" :size="14" />
            {{ bt.label }}
          </button>
        </div>
        <div class="nav-advanced">
          <label class="advanced-toggle">
            <span>{{ t('settings.advancedToggle.label') }}</span>
            <input type="checkbox" v-model="showAdvanced" class="sr-only" />
            <span class="switch" :class="{ on: showAdvanced }"></span>
          </label>
          <p class="advanced-note">{{ t('settings.advancedToggle.note') }}</p>
        </div>
        <div v-if="showAdvanced" class="nav-group">
          <div class="nav-group-label">{{ t('settings.nav.advanced') }}</div>
          <button v-for="at in advancedTabs" :key="at.id" :class="['nav-item', { active: tab === at.id }]" @click="tab = at.id">
            <component :is="at.icon" :size="14" />
            {{ at.label }}
          </button>
        </div>
        <div class="nav-group lang-switch">
          <div class="nav-group-label">{{ t('settings.language.label') }}</div>
          <button
            v-for="opt in languageOptions"
            :key="opt.code"
            :class="['nav-item', { active: locale === opt.code }]"
            @click="locale = opt.code"
          >
            {{ opt.label }}
          </button>
        </div>
      </aside>

      <div class="settings-content">

        <!-- ===== AI 服务配置 ===== -->
        <div v-if="tab === 'ai'" class="settings-scroll">
          <div class="settings-head">
            <h2 class="settings-title">{{ t('settings.ai.title') }}</h2>
            <p class="settings-desc">{{ t('settings.ai.desc') }}</p>
          </div>
          <section class="card quick-card">
            <div class="quick-card-head">
              <div class="setup-title">{{ t('settings.ai.quick.title') }}</div>
              <span class="tag tag-accent">{{ t('common.recommended') }}</span>
            </div>
            <p class="setup-desc">
              {{ t('settings.ai.quick.desc') }}
              <a class="huobao-site-link" href="https://api.chatfire.site" target="_blank" rel="noopener noreferrer">
                {{ t('settings.ai.quick.linkText') }}
                <ExternalLink :size="12" :stroke-width="1.8" />
              </a>
            </p>
            <div class="huobao-quick-row">
              <input v-model="huobaoApiKey" class="input" type="password" :placeholder="t('settings.ai.quick.keyPlaceholder')" />
              <button class="btn btn-primary" :disabled="huobaoSaving" @click="applyHuobaoQuickConfig">
                <Loader2 v-if="huobaoSaving" :size="13" class="animate-spin" />
                <Sparkles v-else :size="13" />
                {{ t('settings.ai.quick.applyBtn') }}
              </button>
            </div>
            <div class="huobao-quick-models">
              <div v-for="q in huobaoQuickConfigs" :key="q.name" class="hqm-row">
                <span class="hqm-label">{{ serviceMeta[q.service_type].label }}</span>
                <span class="hqm-provider">{{ q.provider }}</span>
                <span class="hqm-models mono">
                  <span v-for="(m, i) in q.model" :key="m" :class="['hqm-model', { 'is-default': i === 0 }]">
                    {{ m }}<em v-if="i === 0">{{ t('common.default') }}</em>
                  </span>
                </span>
              </div>
            </div>
          </section>
          <section class="card setup-panel">
            <div class="setup-panel-head compact">
              <div>
                <div class="setup-title">{{ t('settings.ai.manual.title') }}</div>
                <div class="setup-desc">{{ t('settings.ai.manual.desc') }}</div>
              </div>
            </div>
            <div class="template-row">
              <button
                v-for="st in serviceTypes"
                :key="st.type"
                class="template-type-chip"
                @click="startAddCfg(st.type)"
              >
                {{ st.label }}
              </button>
            </div>
          </section>
          <div class="sections">
            <section v-for="st in serviceTypes" :key="st.type" class="card svc-group">
              <div class="svc-group-head">
                <div class="svc-group-heading">
                  <span class="svc-group-title">{{ st.label }}</span>
                  <div class="svc-group-sub">{{ serviceMeta[st.type].desc }}</div>
                </div>
                <span v-if="countActive(st.type)" class="tag tag-accent">{{ t('settings.ai.enabledCount', { count: countActive(st.type) }) }}</span>
                <button class="btn btn-ghost btn-sm ml-auto" @click="startAddCfg(st.type)"><Plus :size="13" /> {{ t('common.add') }}</button>
              </div>
              <div v-for="c in byType(st.type)" :key="c.id" class="config-row">
                <div class="provider-badge" :data-provider="c.provider">{{ c.provider.slice(0, 1).toUpperCase() }}</div>
                <div class="config-main">
                  <div class="config-line">
                    <span class="config-name">{{ c.name || `${c.provider}-${c.service_type}` }}</span>
                    <span :class="['tag', c.api_key ? 'tag-success' : 'tag-error']">{{ c.api_key ? t('settings.ai.hasKey') : t('settings.ai.noKey') }}</span>
                    <span v-if="!c.is_active" class="tag">{{ t('common.disabled') }}</span>
                  </div>
                  <div class="config-models">
                    <button
                      v-for="m in c.model" :key="m" type="button"
                      :class="['cfg-model-chip mono', { 'is-default': isDefaultModel(st.type, c, m) }]"
                      :title="isDefaultModel(st.type, c, m) ? t('settings.ai.currentDefaultModel') : t('settings.ai.setDefaultModel')"
                      @click="setDefaultModel(st.type, c, m)"
                    >
                      <Star v-if="isDefaultModel(st.type, c, m)" :size="9" class="cfg-model-star" />
                      {{ m }}
                    </button>
                  </div>
                  <div class="config-sub mono truncate">{{ c.base_url || t('settings.ai.noBaseUrl') }}</div>
                </div>
                <button v-if="st.type === 'text'" class="btn btn-ghost btn-sm" @click="testExistingCfg(c)">{{ t('common.test') }}</button>
                <label class="config-switch">
                  <input type="checkbox" class="sr-only" :checked="c.is_active" @change="toggleCfg(c)">
                  <span class="switch" :class="{ on: c.is_active }"></span>
                </label>
                <button class="btn btn-ghost btn-icon btn-sm" @click="startEditCfg(c)"><Pencil :size="13" /></button>
                <button class="btn btn-danger btn-icon btn-sm" @click="delCfg(c.id)"><Trash2 :size="13" /></button>
              </div>
              <p v-if="!byType(st.type).length" class="config-empty">{{ t('settings.ai.noConfig') }}</p>
            </section>
          </div>
        </div>

        <!-- ===== 风格预设 ===== -->
        <div v-else-if="tab === 'styles'" class="settings-scroll">
          <div class="settings-head">
            <h2 class="settings-title">{{ t('settings.styles.title') }}</h2>
            <p class="settings-desc">{{ t('settings.styles.desc') }}</p>
          </div>
          <section class="card svc-group">
            <div class="svc-group-head">
              <div class="svc-group-heading">
                <span class="svc-group-title">{{ t('settings.styles.all') }}</span>
                <div class="svc-group-sub">{{ t('settings.styles.countSummary', { active: stylePresets.filter(p => p.is_active).length, total: stylePresets.length }) }}</div>
              </div>
              <button class="btn btn-ghost btn-sm ml-auto" @click="startAddStyle"><Plus :size="13" /> {{ t('common.add') }}</button>
            </div>
            <div v-for="p in stylePresets" :key="p.id" class="config-row">
              <div class="provider-badge style-badge"><Palette :size="15" /></div>
              <div class="config-main">
                <div class="config-line">
                  <span class="config-name">{{ p.name }}</span>
                  <span class="tag mono">{{ p.value }}</span>
                  <span v-if="!p.is_active" class="tag">{{ t('common.disabled') }}</span>
                </div>
                <div class="config-sub mono truncate">{{ p.prompt }}</div>
                <div v-if="p.description" class="config-sub truncate">{{ p.description }}</div>
              </div>
              <label class="config-switch">
                <input type="checkbox" class="sr-only" :checked="p.is_active" @change="toggleStyle(p)">
                <span class="switch" :class="{ on: p.is_active }"></span>
              </label>
              <button class="btn btn-ghost btn-icon btn-sm" @click="startEditStyle(p)"><Pencil :size="13" /></button>
              <button class="btn btn-danger btn-icon btn-sm" @click="styleToDelete = p"><Trash2 :size="13" /></button>
            </div>
            <p v-if="!stylePresets.length" class="config-empty">{{ t('settings.styles.empty') }}</p>
          </section>
        </div>

        <!-- ===== Agent 配置 ===== -->
        <div v-else-if="tab === 'agents'" class="settings-scroll">
          <div class="settings-head">
            <h2 class="settings-title">{{ t('settings.agents.title') }}</h2>
            <p class="settings-desc">{{ t('settings.agents.desc') }}</p>
          </div>
          <div class="agent-list">
            <div v-for="a in agentDefs" :key="a.type" class="card agent-card">
              <div class="agent-card-head" @click="toggleAgentEdit(a.type)">
                <div class="agent-type-badge">{{ a.icon }}</div>
                <div class="agent-card-heading">
                  <div class="agent-card-title">{{ a.label }}</div>
                  <div class="agent-card-type dim">{{ a.type }}</div>
                </div>
                <span v-if="getAgentCfg(a.type) && !getAgentCfg(a.type).is_default" class="tag tag-success">{{ t('settings.agents.custom') }}</span>
                <span v-else class="tag">{{ t('settings.agents.default') }}</span>
                <ChevronDown :size="14" :style="{ transform: editingAgent === a.type ? 'rotate(180deg)' : '', transition: '0.2s' }" />
              </div>
              <div v-if="editingAgent === a.type" class="agent-card-body">
                <label class="field">
                  <span class="field-label">{{ t('settings.agents.modelLabel') }} <span class="dim">{{ t('settings.agents.modelHint') }}</span></span>
                  <BaseSelect v-model="agentForm.model" :options="textModelSelectOptions" :placeholder="t('settings.agents.modelPlaceholder')" searchable />
                </label>
                <label class="field">
                  <span class="field-label">System Prompt <span class="dim">{{ t('settings.agents.promptHint', { type: a.type }) }}</span></span>
                  <textarea v-model="agentForm.system_prompt" class="textarea" rows="12" :placeholder="t('settings.agents.promptPlaceholder')" />
                </label>
                <div class="agent-card-foot">
                  <button class="btn btn-ghost btn-sm" @click="resetAgentPrompt(a.type)">{{ t('settings.agents.resetBtn') }}</button>
                  <span v-if="agentSaved === a.type" class="tag tag-success" style="margin-left:8px">
                    <Check :size="10" /> {{ t('settings.agents.saved') }}
                  </span>
                  <button class="btn btn-primary btn-sm ml-auto" :disabled="agentSaving" @click="saveAgentCfg(a.type)">
                    <Loader2 v-if="agentSaving" :size="12" class="animate-spin" />
                    {{ t('settings.agents.save') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== Skills 编辑 ===== -->
        <div v-else-if="tab === 'skills'" class="skills-layout">
          <!-- Agent 左侧列表 -->
          <aside class="skills-agent-list">
            <div class="skills-agent-title">{{ t('settings.skills.agentListTitle') }}</div>
            <button
              v-for="a in agentDefs"
              :key="a.type"
              :class="['skills-agent-item', { active: selectedAgent === a.type }]"
              @click="selectAgent(a.type)"
            >
              <span class="agent-type-badge">{{ a.icon }}</span>
              <span class="skills-agent-label">{{ a.label }}</span>
              <span v-if="agentSkillCount(a.type) > 0" class="skill-count-badge">{{ agentSkillCount(a.type) }}</span>
            </button>
          </aside>

          <!-- Skill 管理右侧主区域 -->
          <div class="settings-scroll skills-main">
            <div class="settings-head skills-head">
              <span class="agent-type-badge skills-head-badge">{{ selectedAgentIcon }}</span>
              <div class="skills-head-copy">
                <h2 class="settings-title">{{ selectedAgentLabel }}</h2>
                <div class="dim" style="font-size:12px;margin-top:2px">{{ selectedAgentType }} — {{ t('settings.skills.skillsSuffix') }}</div>
                <p class="settings-desc">{{ t('settings.skills.desc') }}</p>
              </div>
              <button class="btn btn-primary btn-sm ml-auto" @click="startAddSkill">
                <Plus :size="13" /> {{ t('settings.skills.addBtn') }}
              </button>
            </div>

            <!-- 无 skill 提示 -->
            <div v-if="!currentSkills.length" class="card skills-empty">
              <div class="skills-empty-icon">
                <FileText :size="24" />
              </div>
              <div class="skills-empty-title">{{ t('settings.skills.empty.title') }}</div>
              <div class="skills-empty-desc">{{ t('settings.skills.empty.desc') }}</div>
            </div>

            <!-- Skill 列表 -->
            <div class="skill-list" v-else>
              <div v-for="s in currentSkills" :key="s.id" class="card skill-card">
                <div class="skill-card-head" @click="toggleSkillEdit(s.id)">
                  <FileText :size="14" style="color:var(--accent);flex-shrink:0" />
                  <div style="flex:1;min-width:0">
                    <div style="font-weight:600;font-size:13px">{{ s.name }}</div>
                    <div class="dim" style="font-size:11px">{{ s.description }}</div>
                  </div>
                  <button class="btn btn-danger btn-icon btn-sm" style="margin-right:4px" @click.stop="skillToDelete = s.id">
                    <Trash2 :size="13" />
                  </button>
                  <ChevronDown :size="14" :style="{ transform: editingSkill === s.id ? 'rotate(180deg)' : '', transition: '0.2s' }" />
                </div>
                <div v-if="editingSkill === s.id" class="skill-card-body">
                  <textarea
                    v-model="skillContent"
                    class="textarea mono"
                    rows="20"
                    style="font-size:12px;line-height:1.6"
                    :placeholder="t('settings.skills.contentPlaceholder')"
                  />
                  <div class="skill-card-foot">
                    <span class="dim" style="font-size:11px">skills/{{ s.id }}/SKILL.md</span>
                    <span v-if="skillSaved === s.id" class="tag tag-success" style="margin-left:8px">
                      <Check :size="10" /> {{ t('settings.skills.saved') }}
                    </span>
                    <button class="btn btn-primary btn-sm ml-auto" :disabled="skillSaving" @click="saveSkill(s.id)">
                      <Loader2 v-if="skillSaving" :size="12" class="animate-spin" />
                      {{ t('settings.skills.save') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Config Dialog -->
    <div v-if="cfgDialog" class="overlay" @click.self="cfgDialog = false">
      <form class="dialog config-dialog" @submit.prevent="saveCfg">
        <div class="dialog-head">
          <div>
            <div class="dialog-title">{{ cfgEditId ? t('settings.dialogs.editConfigTitle') : t('settings.dialogs.addConfigTitle', { type: serviceMeta[cfgForm.service_type].label }) }}</div>
            <div class="dialog-sub">{{ t('settings.dialogs.configSub') }}</div>
          </div>
          <span class="tag tag-accent ml-auto">{{ serviceMeta[cfgForm.service_type].label }}</span>
        </div>
        <div class="dialog-body config-dialog-body">
          <div class="preset-picker">
            <button
              v-for="preset in presetsByType(cfgForm.service_type)"
              :key="`${cfgForm.service_type}-${preset.provider}`"
              type="button"
              class="preset-pill"
              @click="applyProviderPreset(cfgForm.service_type, preset.provider)"
            >
              {{ preset.label }}
            </button>
          </div>
          <label class="field">
            <span class="field-label">{{ t('settings.ai.nameLabel') }}</span>
            <input v-model="cfgForm.name" class="input" :placeholder="t('settings.ai.namePlaceholder')" />
          </label>
          <label class="field"><span class="field-label">{{ t('settings.ai.providerLabel') }}</span>
            <BaseSelect v-model="cfgForm.provider" :options="providerSelectOptions" :placeholder="t('settings.ai.providerPlaceholder')" searchable />
          </label>
          <label class="field">
            <span class="field-label">{{ t('settings.ai.priorityLabel') }}</span>
            <input v-model.number="cfgForm.priority" class="input" type="number" min="0" max="999" />
            <span class="field-hint">{{ t('settings.ai.priorityHint') }}</span>
          </label>
          <label class="field"><span class="field-label">{{ t('settings.ai.apiKeyLabel') }}</span><input v-model="cfgForm.api_key" class="input" type="password" placeholder="sk-..." /></label>
          <label class="field">
            <span class="field-label">{{ t('settings.ai.baseUrlLabel') }}</span>
            <input v-model="cfgForm.base_url" class="input" placeholder="https://..." />
            <span v-if="cfgForm.provider === 'aliyun'" class="field-hint">{{ t('settings.ai.aliyunWorkspaceHint') }}</span>
          </label>
          <label class="field"><span class="field-label">{{ t('settings.ai.modelLabel') }}</span><input v-model="cfgForm.modelStr" class="input" :placeholder="t('settings.ai.modelPlaceholder')" /></label>
          <label v-if="cfgForm.service_type === 'text'" class="field">
            <span class="field-label">{{ t('settings.ai.temperatureLabel') }} <span class="dim">{{ t('settings.ai.temperatureHintOptional') }}</span></span>
            <input v-model="cfgForm.temperature" class="input" type="number" step="0.1" min="0" max="2" :placeholder="t('settings.ai.temperaturePlaceholder')" />
            <span class="field-hint">{{ t('settings.ai.temperatureHint') }}</span>
          </label>
          <div v-if="cfgTestResult" class="test-result" :class="{ ok: cfgTestResult.reachable, bad: !cfgTestResult.reachable }">
            <div class="test-result-head">
              <span class="tag" :class="cfgTestResult.reachable ? 'tag-success' : 'tag-error'">{{ cfgTestResult.status || 'ERROR' }}</span>
              <span>{{ cfgTestResult.message }}</span>
            </div>
            <div class="mono test-result-url">{{ cfgTestResult.method }} {{ cfgTestResult.url }}</div>
            <div v-if="cfgTestResult.response_preview" class="mono test-result-preview">{{ cfgTestResult.response_preview }}</div>
          </div>
        </div>
        <div class="dialog-foot">
          <button type="button" class="btn btn-ghost test-draft-btn" :disabled="cfgTesting" @click="testDraftCfg">
            <Loader2 v-if="cfgTesting" :size="12" class="animate-spin" />
            <span v-else>{{ t('settings.ai.testConfig') }}</span>
          </button>
          <button type="button" class="btn" @click="cfgDialog = false">{{ t('common.cancel') }}</button>
          <button type="submit" class="btn btn-primary">{{ t('common.save') }}</button>
        </div>
      </form>
    </div>

    <!-- Add Skill Dialog -->
    <div v-if="addSkillDialog" class="overlay" @click.self="addSkillDialog = false">
      <form class="dialog skill-dialog" @submit.prevent="confirmAddSkill">
        <div class="dialog-head">
          <div class="dialog-title">{{ t('settings.skills.addDialog.title', { label: selectedAgentLabel }) }}</div>
        </div>
        <div class="dialog-body skill-dialog-body">
          <label class="field">
            <span class="field-label">{{ t('settings.skills.addDialog.dirLabel') }} <span class="dim">{{ t('settings.skills.addDialog.dirHint') }}</span></span>
            <input v-model="newSkillForm.id" class="input" :placeholder="t('settings.skills.addDialog.dirPlaceholder')" />
          </label>
          <label class="field">
            <span class="field-label">{{ t('settings.skills.addDialog.nameLabel') }}</span>
            <input v-model="newSkillForm.name" class="input" :placeholder="t('settings.skills.addDialog.namePlaceholder')" />
          </label>
          <label class="field">
            <span class="field-label">{{ t('settings.skills.addDialog.descLabel') }}</span>
            <input v-model="newSkillForm.description" class="input" :placeholder="t('settings.skills.addDialog.descPlaceholder')" />
          </label>
        </div>
        <div class="dialog-foot">
          <button type="button" class="btn" @click="addSkillDialog = false">{{ t('common.cancel') }}</button>
          <button type="submit" class="btn btn-primary" :disabled="!newSkillForm.id">{{ t('common.create') }}</button>
        </div>
      </form>
    </div>

    <!-- Style Preset Dialog -->
    <div v-if="styleDialog" class="overlay" @click.self="styleDialog = false">
      <form class="dialog config-dialog" @submit.prevent="saveStyle">
        <div class="dialog-head">
          <div>
            <div class="dialog-title">{{ styleEditId ? t('settings.styles.dialog.editTitle') : t('settings.styles.dialog.addTitle') }}</div>
            <div class="dialog-sub">{{ t('settings.styles.dialog.sub') }}</div>
          </div>
          <span class="tag tag-accent ml-auto"><Palette :size="12" /> {{ t('settings.styles.dialog.tag') }}</span>
        </div>
        <div class="dialog-body config-dialog-body">
          <label class="field">
            <span class="field-label">{{ t('settings.styles.dialog.nameLabel') }} <span class="required">*</span></span>
            <input v-model="styleForm.name" class="input" :placeholder="t('settings.styles.dialog.namePlaceholder')" />
          </label>
          <label class="field">
            <span class="field-label">{{ t('settings.styles.dialog.keyLabel') }} <span class="required">*</span></span>
            <input v-model="styleForm.value" class="input mono" :placeholder="t('settings.styles.dialog.keyPlaceholder')" :disabled="!!styleEditId" />
            <span class="field-hint">{{ t('settings.styles.dialog.keyHint') }}</span>
          </label>
          <label class="field">
            <span class="field-label">{{ t('settings.styles.dialog.promptLabel') }} <span class="required">*</span></span>
            <textarea v-model="styleForm.prompt" class="textarea" rows="3" :placeholder="t('settings.styles.dialog.promptPlaceholder')"></textarea>
          </label>
          <label class="field">
            <span class="field-label">{{ t('settings.styles.dialog.descLabel') }}</span>
            <input v-model="styleForm.description" class="input" :placeholder="t('settings.styles.dialog.descPlaceholder')" />
          </label>
          <label class="field">
            <span class="field-label">{{ t('settings.styles.dialog.sortLabel') }}</span>
            <input v-model.number="styleForm.sort_order" class="input" type="number" min="0" max="999" />
          </label>
        </div>
        <div class="dialog-foot">
          <button type="button" class="btn" @click="styleDialog = false">{{ t('common.cancel') }}</button>
          <button type="submit" class="btn btn-primary">{{ t('common.save') }}</button>
        </div>
      </form>
    </div>
    <ConfirmDialog
      :open="!!styleToDelete"
      :title="t('settings.styles.deleteDialog.title')"
      :message="t('settings.styles.deleteDialog.message', { name: styleToDelete?.name })"
      :loading="deletingStyle"
      @confirm="confirmDelStyle"
      @cancel="styleToDelete = null"
    />
    <ConfirmDialog
      :open="!!skillToDelete"
      :title="t('settings.skills.deleteDialog.title')"
      :message="t('settings.skills.deleteDialog.message', { id: skillToDelete })"
      :loading="deletingSkill"
      @confirm="confirmDelSkill"
      @cancel="skillToDelete = null"
    />
  </div>
</template>

<script setup>
import { Plus, Pencil, Trash2, FileText, ChevronDown, Check, Loader2, Bot, Cpu, Sparkles, Palette, ExternalLink, Star } from 'lucide-vue-next'
import BaseSelect from '~/components/BaseSelect.vue'
import { toast } from 'vue-sonner'
import { aiConfigAPI, promptAPI, skillsAPI, stylePresetAPI } from '~/composables/useApi'
import brandLogo from '~/assets/huobao-logo.png'

const { t, locale } = useI18n()
const languageOptions = computed(() => [
  { code: 'zh-CN', label: t('settings.language.zh') },
  { code: 'en', label: t('settings.language.en') },
])

const showBrandImage = ref(true)
const tab = ref('ai')
const showAdvanced = ref(false)
const baseTabs = computed(() => [
  { id: 'ai', label: t('settings.tabs.ai'), icon: Cpu },
  { id: 'styles', label: t('settings.tabs.styles'), icon: Palette },
])
const advancedTabs = computed(() => [
  { id: 'agents', label: t('settings.tabs.agents'), icon: Bot },
  { id: 'skills', label: t('settings.tabs.skills'), icon: FileText },
])
watch(showAdvanced, (v) => {
  if (!v && advancedTabs.value.some(at => at.id === tab.value)) tab.value = 'ai'
})

// ===== AI Service Configs =====
const cfgs = ref([])
const cfgDialog = ref(false)
const cfgEditId = ref(null)
const cfgTesting = ref(false)
const cfgTestResult = ref(null)
const huobaoApiKey = ref('')
const huobaoSaving = ref(false)
const cfgForm = reactive({ name: '', provider: '', api_key: '', base_url: '', modelStr: '', service_type: 'text', priority: 0, temperature: '' })
const serviceTypes = computed(() => [
  { type: 'text', label: t('common.serviceType.text') },
  { type: 'image', label: t('common.serviceType.image') },
  { type: 'video', label: t('common.serviceType.video') },
])
const providers = ['gemini', 'openai', 'volcengine', 'minimax', 'aliyun']
const providerSelectOptions = computed(() => providers.map(p => ({ label: p, value: p })))
const serviceMeta = computed(() => ({
  text: { label: t('common.serviceType.text'), desc: t('settings.ai.serviceMeta.textDesc') },
  image: { label: t('common.serviceType.image'), desc: t('settings.ai.serviceMeta.imageDesc') },
  video: { label: t('common.serviceType.video'), desc: t('settings.ai.serviceMeta.videoDesc') },
}))
const providerPresets = computed(() => ({
  text: {
    gemini: { label: t('settings.presetLabel.geminiOfficial'), baseUrl: 'https://generativelanguage.googleapis.com', models: ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3-flash-preview'] },
    openai: { label: t('settings.presetLabel.openaiOfficial'), baseUrl: 'https://api.openai.com', models: ['deepseek-v4-pro', 'gpt-5.6-terra'] },
  },
  image: {
    gemini: { label: t('settings.presetLabel.geminiOfficial'), baseUrl: 'https://generativelanguage.googleapis.com', models: ['gemini-3-pro-image', 'gemini-3.1-flash-image'] },
    openai: { label: t('settings.presetLabel.openaiOfficial'), baseUrl: 'https://api.openai.com', models: ['gpt-image-2'] },
  },
  video: {
    volcengine: { label: t('settings.presetLabel.seedanceOfficial'), baseUrl: 'https://ark.cn-beijing.volces.com', models: ['doubao-seedance-2-0-mini-260615', 'doubao-seedance-2-0-fast-260128', 'doubao-seedance-2-0-260128'] },
    minimax: { label: t('settings.presetLabel.minimaxOfficial'), baseUrl: 'https://api.minimaxi.com', models: ['MiniMax-H3'] },
    aliyun: { label: t('settings.presetLabel.aliyunOfficial'), baseUrl: 'https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com', models: ['wan3.0-video-prime', 'wan3.0-video'] },
  },
}))
const huobaoQuickConfigs = [
  { service_type: 'text', provider: 'gemini', name: '火宝文本服务 · Gemini', base_url: 'https://api.chatfire.site', model: ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3-flash-preview'], priority: 100 },
  { service_type: 'text', provider: 'openai', name: '火宝文本服务 · OpenAI', base_url: 'https://api.chatfire.site', model: ['deepseek-v4-pro', 'deepseek-v4-flash', 'gpt-5.6-terra'], priority: 101 },
  { service_type: 'image', provider: 'openai', name: '火宝图片服务 · OpenAI', base_url: 'https://api.chatfire.site', model: ['gpt-image-2'], priority: 99 },
  { service_type: 'image', provider: 'gemini', name: '火宝图片服务 · Gemini', base_url: 'https://api.chatfire.site', model: ['gemini-3-pro-image', 'gemini-3.1-flash-image'], priority: 97 },
  { service_type: 'video', provider: 'volcengine', name: '火宝视频服务 · Seedance', base_url: 'https://api.chatfire.site/volcengine', model: ['doubao-seedance-2-0-mini-260615', 'doubao-seedance-2-0-fast-260128', 'doubao-seedance-2-0-260128'], priority: 98 },
  { service_type: 'video', provider: 'aliyun', name: '火宝视频服务 · Wan 3.0', base_url: 'https://api.chatfire.site/qwen', model: ['wan3.0-video-prime', 'wan3.0-video'], priority: 97 },
  { service_type: 'video', provider: 'minimax', name: '火宝视频服务 · MiniMax', base_url: 'https://api.chatfire.site/minimax', model: ['MiniMax-H3'], priority: 96 },
]

function byType(svcType) { return cfgs.value.filter(c => c.service_type === svcType) }
function countActive(svcType) { return byType(svcType).filter(c => c.is_active).length }
function fmtModel(m) { return Array.isArray(m) ? m.join(', ') : m || '—' }
function presetsByType(type) {
  const group = providerPresets.value[type] || {}
  return Object.entries(group).map(([provider, preset]) => ({ provider, ...preset }))
}
function applyProviderPreset(type, provider) {
  const preset = providerPresets.value[type]?.[provider]
  if (!preset) return
  cfgForm.provider = provider
  cfgForm.base_url = preset.baseUrl
  cfgForm.modelStr = preset.models.join(', ')
  cfgForm.name = `${preset.label}-${serviceMeta.value[type].label}`
}

async function loadCfgs() { try { cfgs.value = await aiConfigAPI.list() } catch (e) { toast.error(e.message) } }

// ===== 默认模型选择 =====
// 默认解析规则与工作台/后端一致：启用配置中优先级最高者的模型列表首位
function defaultModelOf(type) {
  const active = cfgs.value.filter(c => c.service_type === type && c.is_active)
  if (!active.length) return null
  const top = [...active].sort((a, b) => (b.priority || 0) - (a.priority || 0))[0]
  const first = Array.isArray(top.model) ? top.model[0] : null
  return first ? { configId: top.id, model: first } : null
}
function isDefaultModel(type, c, m) {
  const d = defaultModelOf(type)
  return !!d && d.configId === c.id && d.model === m
}
const defaultSaving = ref(false)
async function setDefaultModel(type, c, m) {
  if (defaultSaving.value || isDefaultModel(type, c, m)) return
  defaultSaving.value = true
  try {
    const models = [m, ...(Array.isArray(c.model) ? c.model : []).filter(x => x !== m)]
    const maxPriority = Math.max(0, ...cfgs.value.filter(x => x.service_type === type).map(x => x.priority || 0))
    const payload = { model: models }
    if ((c.priority || 0) < maxPriority) payload.priority = maxPriority + 1
    if (!c.is_active) payload.is_active = true // 停用配置无法成为默认,选择即启用
    await aiConfigAPI.update(c.id, payload)
    toast.success(t('settings.ai.toast.defaultModelSwitched', { type: serviceMeta.value[type].label, model: m }))
    await loadCfgs()
  } catch (e) {
    toast.error(e.message)
  } finally {
    defaultSaving.value = false
  }
}
async function toggleCfg(c) { await aiConfigAPI.update(c.id, { is_active: !c.is_active }); loadCfgs() }
async function delCfg(id) { await aiConfigAPI.del(id); toast.success(t('settings.ai.toast.deleted')); loadCfgs() }
async function applyHuobaoQuickConfig() {
  const apiKey = huobaoApiKey.value.trim()
  if (!apiKey) { toast.warning(t('settings.ai.toast.fillApiKey')); return }
  huobaoSaving.value = true
  try {
    for (const preset of huobaoQuickConfigs) {
      const payload = { ...preset, api_key: apiKey }
      const existing = cfgs.value.find(c => c.name === preset.name || (c.service_type === preset.service_type && c.provider === preset.provider && c.base_url === preset.base_url))
      if (existing) await aiConfigAPI.update(existing.id, payload)
      else await aiConfigAPI.create(payload)
    }
    toast.success(t('settings.ai.toast.quickApplied'))
    huobaoApiKey.value = ''
    await loadCfgs()
  } catch (e) {
    toast.error(e.message)
  } finally {
    huobaoSaving.value = false
  }
}
function startAddCfg(t) {
  cfgEditId.value = null
  cfgTestResult.value = null
  Object.assign(cfgForm, { name: '', provider: '', api_key: '', base_url: '', modelStr: '', service_type: t, priority: 0, temperature: '' })
  const firstPreset = presetsByType(t)[0]
  if (firstPreset) applyProviderPreset(t, firstPreset.provider)
  cfgDialog.value = true
}
function startEditCfg(c) {
  cfgEditId.value = c.id
  cfgTestResult.value = null
  Object.assign(cfgForm, {
    name: c.name || '',
    provider: c.provider,
    api_key: c.api_key || '',
    base_url: c.base_url || '',
    modelStr: fmtModel(c.model),
    service_type: c.service_type,
    priority: c.priority ?? 0,
    temperature: c.temperature ?? '',
  })
  cfgDialog.value = true
}
async function testCfgPayload(payload) {
  cfgTesting.value = true
  try {
    cfgTestResult.value = await aiConfigAPI.test(payload)
    if (cfgTestResult.value.reachable) toast.success(t('settings.ai.toast.endpointOk'))
    else toast.warning(t('settings.ai.toast.endpointFailed'))
  } catch (e) {
    toast.error(e.message)
  } finally {
    cfgTesting.value = false
  }
}
async function testDraftCfg() {
  await testCfgPayload({
    service_type: cfgForm.service_type,
    provider: cfgForm.provider,
    api_key: cfgForm.api_key,
    base_url: cfgForm.base_url,
    model: cfgForm.modelStr.split(',').map(s => s.trim()).filter(Boolean),
  })
}
async function testExistingCfg(c) {
  startEditCfg(c)
  await testCfgPayload({
    service_type: c.service_type,
    provider: c.provider,
    api_key: c.api_key || '',
    base_url: c.base_url || '',
    model: Array.isArray(c.model) ? c.model : [],
  })
}
async function saveCfg() {
  if (!cfgForm.provider) { toast.warning(t('settings.ai.toast.selectProvider')); return }
  const models = cfgForm.modelStr.split(',').map(s => s.trim()).filter(Boolean)
  const temperature = cfgForm.temperature === '' || cfgForm.temperature === null ? null : Number(cfgForm.temperature)
  if (temperature !== null && (!Number.isFinite(temperature) || temperature < 0 || temperature > 2)) {
    toast.warning(t('settings.ai.toast.temperatureRange')); return
  }
  try {
    if (cfgEditId.value) await aiConfigAPI.update(cfgEditId.value, { name: cfgForm.name, provider: cfgForm.provider, api_key: cfgForm.api_key, base_url: cfgForm.base_url, model: models, priority: cfgForm.priority, temperature })
    else await aiConfigAPI.create({ service_type: cfgForm.service_type, provider: cfgForm.provider, name: cfgForm.name || `${cfgForm.provider}-${cfgForm.service_type}`, api_key: cfgForm.api_key, base_url: cfgForm.base_url, model: models, priority: cfgForm.priority, temperature })
    cfgDialog.value = false; toast.success(t('settings.ai.toast.saved')); loadCfgs()
  } catch (e) { toast.error(e.message) }
}

// ===== Agent Configs =====
const agentCfgs = ref([])
const editingAgent = ref(null)
const agentSaving = ref(false)
const agentSaved = ref(null)
const agentForm = reactive({ model: '', system_prompt: '' })

const agentDefs = computed(() => [
  { type: 'script_rewriter', label: t('settings.agents.defs.scriptRewriter'), icon: '📝' },
  { type: 'extractor', label: t('settings.agents.defs.extractor'), icon: '🔍' },
  { type: 'storyboard_breaker', label: t('settings.agents.defs.storyboardBreaker'), icon: '🎬' },
  { type: 'prompt_generator', label: t('settings.agents.defs.promptGenerator'), icon: '🖼' },
])

function getAgentCfg(type) {
  return agentCfgs.value.find(a => a.agent_type === type)
}

const textModelGroups = computed(() => {
  return cfgs.value
    .filter(c => c.service_type === 'text' && c.is_active && c.api_key)
    .map(c => ({
      label: `${c.provider} — ${c.name}`,
      models: Array.isArray(c.model) ? c.model : (c.model ? [c.model] : []),
    }))
    .filter(g => g.models.length > 0)
})

const textModelSelectOptions = computed(() =>
  textModelGroups.value.map(g => ({
    label: g.label,
    options: g.models.map(m => ({ label: m, value: m })),
  }))
)

async function loadAgents() {
  try { agentCfgs.value = await promptAPI.list() }
  catch (e) { toast.error(e.message) }
}

async function toggleAgentEdit(type) {
  if (editingAgent.value === type) { editingAgent.value = null; return }
  try {
    const cfg = await promptAPI.get(type)
    agentForm.model = cfg.model || ''
    agentForm.system_prompt = cfg.system_prompt || ''
    agentSaved.value = null
    editingAgent.value = type
  } catch (e) { toast.error(e.message) }
}

async function resetAgentPrompt(type) {
  try {
    await promptAPI.reset(type)
    await loadAgents()
    const cfg = await promptAPI.get(type)
    agentForm.model = cfg.model || ''
    agentForm.system_prompt = cfg.system_prompt || ''
    toast.success(t('settings.agents.toast.resetDone'))
  } catch (e) { toast.error(e.message) }
}

async function saveAgentCfg(type) {
  agentSaving.value = true
  agentSaved.value = null
  try {
    await promptAPI.update(type, {
      name: agentDefs.value.find(a => a.type === type)?.label || type,
      model: agentForm.model,
      system_prompt: agentForm.system_prompt,
    })
    await loadAgents()
    agentSaved.value = type
    toast.success(t('settings.agents.toast.saved', { label: agentDefs.value.find(a => a.type === type)?.label }))
    setTimeout(() => { if (agentSaved.value === type) agentSaved.value = null }, 3000)
  } catch (e) {
    toast.error(e.message)
  } finally {
    agentSaving.value = false
  }
}

// ===== Skills =====
const selectedAgent = ref('script_rewriter')
const allSkills = ref([])   // { id, name, description }[]
const editingSkill = ref(null)
const skillContent = ref('')
const skillSaving = ref(false)
const skillSaved = ref(null)
const addSkillDialog = ref(false)
const newSkillForm = reactive({ id: '', name: '', description: '' })

const selectedAgentType = computed(() => selectedAgent.value)
const selectedAgentLabel = computed(() => agentDefs.value.find(a => a.type === selectedAgent.value)?.label || '')
const selectedAgentIcon = computed(() => agentDefs.value.find(a => a.type === selectedAgent.value)?.icon || '')

// agent type 用下划线（script_rewriter），skill 目录按 Mastra 规范用连字符（script-rewriter）
const skillDirOf = (type) => type.replace(/_/g, '-')
const skillBelongsTo = (skillId, type) => {
  const dir = skillDirOf(type)
  return skillId === dir || skillId.startsWith(dir + '/')
}

function agentSkillCount(type) {
  return allSkills.value.filter(s => skillBelongsTo(s.id, type)).length
}

const currentSkills = computed(() =>
  allSkills.value.filter(s => skillBelongsTo(s.id, selectedAgent.value))
)

async function loadAllSkills() {
  try { allSkills.value = await skillsAPI.list() }
  catch (e) { toast.error(e.message) }
}

async function selectAgent(type) {
  selectedAgent.value = type
  editingSkill.value = null
}

function startAddSkill() {
  newSkillForm.id = ''
  newSkillForm.name = ''
  newSkillForm.description = ''
  addSkillDialog.value = true
}

async function confirmAddSkill() {
  if (!newSkillForm.id) return
  const skillId = `${skillDirOf(selectedAgent.value)}/${newSkillForm.id}`
  try {
    await skillsAPI.create({ id: skillId, name: newSkillForm.name, description: newSkillForm.description })
    addSkillDialog.value = false
    await loadAllSkills()
    toast.success(t('settings.skills.toast.created'))
  } catch (e) {
    toast.error(e.message)
  }
}

const skillToDelete = ref(null)
const deletingSkill = ref(false)

async function confirmDelSkill() {
  const id = skillToDelete.value
  if (!id) return
  try {
    deletingSkill.value = true
    await skillsAPI.del(id)
    if (editingSkill.value === id) editingSkill.value = null
    await loadAllSkills()
    skillToDelete.value = null
    toast.success(t('settings.skills.toast.deleted'))
  } catch (e) {
    toast.error(e.message)
  } finally {
    deletingSkill.value = false
  }
}

async function toggleSkillEdit(id) {
  if (editingSkill.value === id) { editingSkill.value = null; return }
  try {
    const res = await skillsAPI.get(id)
    skillContent.value = res.content
    skillSaved.value = null
    editingSkill.value = id
  } catch (e) { toast.error(e.message) }
}

async function saveSkill(id) {
  skillSaving.value = true
  skillSaved.value = null
  try {
    await skillsAPI.update(id, skillContent.value)
    await loadAllSkills()
    skillSaved.value = id
    toast.success(t('settings.skills.saved'))
    setTimeout(() => { if (skillSaved.value === id) skillSaved.value = null }, 3000)
  } catch (e) {
    toast.error(e.message)
  } finally {
    skillSaving.value = false
  }
}

// ===== Style Presets =====
const stylePresets = ref([])
const styleDialog = ref(false)
const styleEditId = ref(null)
const styleForm = reactive({ name: '', value: '', prompt: '', description: '', sort_order: 0 })

async function loadStylePresets() {
  try { stylePresets.value = await stylePresetAPI.list(true) } catch (e) { toast.error(e.message) }
}

async function toggleStyle(p) {
  try {
    await stylePresetAPI.update(p.id, { is_active: !p.is_active })
    loadStylePresets()
  } catch (e) { toast.error(e.message) }
}

const styleToDelete = ref(null)
const deletingStyle = ref(false)

async function confirmDelStyle() {
  const p = styleToDelete.value
  if (!p) return
  try {
    deletingStyle.value = true
    await stylePresetAPI.del(p.id)
    styleToDelete.value = null
    toast.success(t('settings.styles.toast.deleted'))
    loadStylePresets()
  } catch (e) {
    toast.error(e.message)
  } finally {
    deletingStyle.value = false
  }
}

function startAddStyle() {
  styleEditId.value = null
  Object.assign(styleForm, {
    name: '', value: '', prompt: '', description: '',
    sort_order: (stylePresets.value.at(-1)?.sort_order ?? 0) + 1,
  })
  styleDialog.value = true
}

function startEditStyle(p) {
  styleEditId.value = p.id
  Object.assign(styleForm, {
    name: p.name,
    value: p.value,
    prompt: p.prompt,
    description: p.description || '',
    sort_order: p.sort_order ?? 0,
  })
  styleDialog.value = true
}

async function saveStyle() {
  if (!styleForm.name?.trim() || !styleForm.prompt?.trim() || (!styleEditId.value && !styleForm.value?.trim())) {
    toast.warning(t('settings.styles.toast.requiredFields'))
    return
  }
  try {
    if (styleEditId.value) {
      await stylePresetAPI.update(styleEditId.value, {
        name: styleForm.name,
        prompt: styleForm.prompt,
        description: styleForm.description,
        sort_order: styleForm.sort_order,
      })
    } else {
      await stylePresetAPI.create({ ...styleForm })
    }
    styleDialog.value = false
    toast.success(t('settings.styles.toast.saved'))
    loadStylePresets()
  } catch (e) { toast.error(e.message) }
}

onMounted(() => { loadCfgs(); loadAgents(); loadAllSkills(); loadStylePresets() })
</script>

<style scoped>
.settings-page { display: flex; flex-direction: column; height: 100%; background: var(--bg-base); }
.page-title {
  font-size: 32px; font-weight: 800; letter-spacing: -0.02em;
  color: var(--text-0); padding: 24px 32px 16px;
}

.settings-layout { display: flex; flex: 1; min-height: 0; }

.settings-nav {
  width: 220px; flex-shrink: 0; padding: 4px 12px 16px; border-right: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 14px;
}
.nav-group { display: flex; flex-direction: column; gap: 2px; }
.nav-group-label {
  font-size: 11px; font-weight: 650; color: var(--text-3);
  letter-spacing: 0.06em; padding: 8px 12px 4px;
}
.nav-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; font-size: 13px; font-weight: 550;
  border: none; border-radius: var(--radius); background: transparent; color: var(--text-1);
  cursor: pointer; transition: all 0.16s var(--ease-out); text-align: left; width: 100%;
}
.nav-item:hover { background: var(--bg-hover); color: var(--text-0); }
.nav-item.active { background: var(--accent-bg); color: var(--accent-text); font-weight: 650; }
.nav-item:focus-visible { outline: none; box-shadow: 0 0 0 3.5px var(--button-focus); }

.nav-advanced {
  padding: 12px 4px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.advanced-toggle {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 0 8px; font-size: 12.5px; font-weight: 550; color: var(--text-1); cursor: pointer;
}
.advanced-toggle .switch { width: 38px; height: 23px; }
.advanced-toggle .switch::after { width: 19px; height: 19px; }
.advanced-toggle .switch.on::after { transform: translateX(15px); }
.advanced-toggle input:focus-visible + .switch { box-shadow: 0 0 0 3.5px var(--button-focus); }
.advanced-note {
  margin: 8px 8px 0;
  font-size: 11px;
  line-height: 1.45;
  color: var(--text-3);
}

.settings-content { flex: 1; min-width: 0; min-height: 0; overflow: hidden; }
.settings-scroll { height: 100%; overflow-y: auto; padding: 24px 40px 48px; max-width: 840px; margin: 0 auto; animation: fadeUp 0.3s var(--ease-out); }
.settings-head { margin-bottom: 20px; }
.settings-title { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
.settings-desc { font-size: 13px; color: var(--text-2); margin-top: 6px; }

/* 火宝快捷配置 */
.quick-card {
  padding: 20px;
  margin-bottom: 16px;
  border: 1.5px solid var(--accent);
}
.quick-card:hover { border-color: var(--accent); }
.quick-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.setup-title { font-size: 15px; font-weight: 700; color: var(--text-0); }
.setup-desc { font-size: 12.5px; color: var(--text-2); margin-bottom: 14px; }
.huobao-site-link {
  display: inline-flex; align-items: center; gap: 3px;
  margin-left: 6px;
  color: var(--accent); text-decoration: none;
  font-weight: 600; white-space: nowrap;
}
.huobao-site-link:hover { text-decoration: underline; }
.huobao-quick-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}
.huobao-quick-models {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.hqm-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 11px;
  line-height: 1.6;
}
.hqm-label {
  flex-shrink: 0;
  width: 28px;
  font-weight: 600;
  color: var(--text-2);
}
.hqm-provider {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--accent-bg, rgba(0,113,227,0.10));
  color: var(--accent, #0071e3);
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.hqm-models {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  color: var(--text-3);
}
.hqm-model.is-default { color: var(--text-1); font-weight: 600; }
.hqm-model em {
  font-style: normal;
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-text);
  background: var(--accent-bg);
}

/* 手动模板 */
.setup-panel { padding: 18px 20px; margin-bottom: 16px; }
.setup-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.setup-panel-head.compact { margin-bottom: 12px; }
.template-row { display: flex; flex-wrap: wrap; gap: 8px; }
.template-type-chip {
  min-height: var(--button-height-sm);
  padding: 0 14px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--button-bg);
  color: var(--text-1);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: all 0.16s var(--ease-out);
}
.template-type-chip:hover { background: var(--button-bg-hover); color: var(--text-0); }
.template-type-chip:focus-visible { outline: none; box-shadow: 0 0 0 3.5px var(--button-focus); }

/* 按服务类型分组的配置卡 */
.sections { display: flex; flex-direction: column; gap: 16px; }
.svc-group { overflow: hidden; }
.svc-group-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}
.svc-group-heading { min-width: 0; }
.svc-group-title { font-size: 14px; font-weight: 700; color: var(--text-0); }
.svc-group-sub { font-size: 11.5px; color: var(--text-3); margin-top: 2px; }
.config-row { display: flex; align-items: center; gap: 12px; padding: 12px 20px; }
.config-row + .config-row { border-top: 1px solid var(--border); }
.provider-badge {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; color: #fff;
  background: var(--accent);
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}
.provider-badge[data-provider="openai"] { background: #10a37f; }
.provider-badge[data-provider="gemini"] { background: #4285f4; }
.provider-badge[data-provider="volcengine"] { background: #ff5c39; }
.config-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.config-line { display: flex; align-items: center; gap: 8px; min-width: 0; }
.config-name { font-size: 13.5px; font-weight: 650; color: var(--text-0); }
.config-sub { font-size: 11.5px; color: var(--text-3); }
.config-models { display: flex; flex-wrap: wrap; gap: 4px; margin: 3px 0; }
.cfg-model-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-2);
  font-size: 10.5px;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.cfg-model-chip:hover { border-color: var(--accent); color: var(--accent); }
.cfg-model-chip.is-default {
  border-color: var(--accent);
  background: var(--accent-bg, rgba(0,113,227,0.10));
  color: var(--accent);
  font-weight: 600;
  cursor: default;
}
.cfg-model-star { fill: currentColor; }
.config-empty { font-size: 12px; color: var(--text-3); padding: 14px 20px; }
.config-switch { display: inline-flex; flex-shrink: 0; cursor: pointer; }
.config-switch input:focus-visible + .switch { box-shadow: 0 0 0 3.5px var(--button-focus); }
.btn-icon.btn-sm { width: 30px; min-width: 30px; height: 30px; min-height: 30px; }

/* Agent */
.agent-list { display: flex; flex-direction: column; gap: 10px; }
.agent-card { overflow: hidden; }
.agent-card-head { display: flex; align-items: center; gap: 12px; padding: 14px 18px; cursor: pointer; transition: background 0.15s; }
.agent-card-head:hover { background: var(--bg-hover); }
.agent-type-badge {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--accent-bg); color: var(--accent-text);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.agent-card-heading { flex: 1; min-width: 0; }
.agent-card-title { font-size: 13.5px; font-weight: 650; color: var(--text-0); }
.agent-card-type { font-size: 11.5px; margin-top: 1px; }
.agent-card-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 12px; border-top: 1px solid var(--border); }
.agent-card-foot { display: flex; align-items: center; gap: 8px; padding-top: 4px; }

/* Skills 布局 */
.skills-layout { display: flex; height: 100%; overflow: hidden; }
.skills-agent-list {
  width: 210px; flex-shrink: 0; border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  overflow-y: auto; padding: 4px 10px 16px;
}
.skills-agent-title {
  font-size: 11px; font-weight: 650; letter-spacing: 0.06em;
  color: var(--text-3); padding: 8px 10px 4px;
}
.skills-agent-item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; font-size: 13px; font-weight: 550; cursor: pointer;
  border: none; border-radius: var(--radius); background: transparent; color: var(--text-1);
  transition: all 0.16s var(--ease-out); width: 100%; text-align: left;
}
.skills-agent-item:hover { background: var(--bg-hover); color: var(--text-0); }
.skills-agent-item.active { background: var(--accent-bg); color: var(--accent-text); font-weight: 650; }
.skills-agent-item:focus-visible { outline: none; box-shadow: 0 0 0 3.5px var(--button-focus); }
.skills-agent-item .agent-type-badge { width: 26px; height: 26px; border-radius: 8px; font-size: 13px; }
.skills-agent-label { flex: 1; min-width: 0; }
.skill-count-badge {
  font-size: 10px; font-weight: 700; font-family: var(--font-mono);
  background: rgba(0,0,0,0.06); color: var(--text-2);
  padding: 1px 6px; border-radius: 99px;
}
.skills-agent-item.active .skill-count-badge { background: var(--accent-bg); color: var(--accent-text); }
.skills-main { flex: 1; min-width: 0; }
.skills-main.settings-scroll { max-width: 900px; }
.skills-head { display: flex; align-items: flex-start; gap: 12px; }
.skills-head-badge { width: 32px; height: 32px; font-size: 16px; }
.skills-head-copy { min-width: 0; }
.skills-empty { padding: 48px 24px; text-align: center; }
.skills-empty-icon {
  width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 12px;
  background: var(--accent-bg); color: var(--accent-text);
  display: flex; align-items: center; justify-content: center;
}
.skills-empty-title { font-size: 14px; font-weight: 650; color: var(--text-0); }
.skills-empty-desc { font-size: 12px; color: var(--text-3); margin-top: 4px; }

/* Skill */
.skill-list { display: flex; flex-direction: column; gap: 10px; }
.skill-card { overflow: hidden; }
.skill-card-head { display: flex; align-items: center; gap: 10px; padding: 12px 16px; cursor: pointer; transition: background 0.15s; }
.skill-card-head:hover { background: var(--bg-hover); }
.skill-card-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--border); }
.skill-card-foot { display: flex; align-items: center; gap: 8px; }

/* Shared */
.field { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 12px; font-weight: 550; color: var(--text-1); }
.field-hint { font-size: 11px; color: var(--text-3); margin-top: 2px; }
.required { color: var(--error); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* Dialogs */
.config-dialog { width: min(720px, calc(100vw - 40px)); }
.config-dialog-body { display: flex; flex-direction: column; gap: 14px; }
.skill-dialog { width: 440px; }
.skill-dialog-body { display: flex; flex-direction: column; gap: 12px; }
.dialog-sub { margin-top: 4px; font-size: 12px; color: var(--text-2); }
.test-draft-btn { margin-right: auto; }
.preset-picker { display: flex; flex-wrap: wrap; gap: 8px; }
.preset-pill {
  min-height: var(--button-height-sm);
  padding: 0 14px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--button-bg);
  color: var(--text-1);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: all 0.16s var(--ease-out);
}
.preset-pill:hover { background: var(--button-bg-hover); color: var(--text-0); }
.preset-pill:focus-visible { outline: none; box-shadow: 0 0 0 3.5px var(--button-focus); }
.test-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  border: 1px solid var(--border);
  background: var(--bg-0);
}
.test-result.ok { border-color: rgba(52,199,89,0.4); background: var(--success-bg); }
.test-result.bad { border-color: rgba(255,59,48,0.4); background: var(--error-bg); }
.test-result-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-1);
}
.test-result-url,
.test-result-preview {
  font-size: 11px;
  color: var(--text-2);
  word-break: break-all;
}
</style>
