#!/usr/bin/env python3
"""
Script para atualizar os formulários SDR e Closer
Remove campos meta_* e adiciona novos campos ao Closer
"""

import re

# Atualizar SDRForm.jsx
sdr_file = 'src/components/SDRForm.jsx'

print("Atualizando SDRForm.jsx...")

with open(sdr_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Remover meta_reunioes do formData inicial
content = re.sub(
    r'reunioes_realizadas: 0,\s*meta_reunioes: 0',
    'reunioes_realizadas: 0',
    content
)

# Atualizar useState de metaPessoa
content = re.sub(
    r'const \[metaPessoa, setMetaPessoa\] = useState\(\{ meta_reunioes: 0 \}\);',
    'const [metaPessoa, setMetaPessoa] = useState({ meta_reunioes: 0 });',
    content
)

# Remover preenchimento automático da meta
content = re.sub(
    r'// Preencher meta automaticamente se vazia\s*if \(formData\.meta_reunioes === 0 && meta\.meta_reunioes > 0\) \{\s*setFormData\(prev => \(\{\s*\.\.\.prev,\s*meta_reunioes: meta\.meta_reunioes\s*\}\)\);\s*\}',
    '',
    content, flags=re.DOTALL
)

# Atualizar handleChange
content = re.sub(
    r"'mes', 'ano', 'leads_recebidos', 'reunioes_agendadas', 'reunioes_realizadas', 'meta_reunioes'",
    "'mes', 'ano', 'leads_recebidos', 'reunioes_agendadas', 'reunioes_realizadas'",
    content
)

# Remover campo de input Meta Reuniões (procurar e remover todo o bloco)
meta_input_pattern = r'<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">\s*Meta Reuniões\s*</label>\s*<input\s+type="number"\s+name="meta_reunioes"[^>]*>\s*</div>'
content = re.sub(meta_input_pattern, '', content, flags=re.DOTALL)

# Atualizar display da meta
content = re.sub(
    r'\{formData\.sdr && metaPessoa\.meta_reunioes > 0 &&',
    '{formData.sdr &&',
    content
)

with open(sdr_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ SDRForm.jsx atualizado")

# Atualizar CloserForm.jsx
closer_file = 'src/components/CloserForm.jsx'

print("\nAtualizando CloserForm.jsx...")

with open(closer_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar novos campos ao formData
content = re.sub(
    r'(vendas: 0,\s*faturamento: 0,)\s*(meta_vendas: 0,\s*meta_faturamento: 0)',
    r'\1\n    booking: 0,\n    faturamento_bruto: 0,\n    faturamento_liquido: 0',
    content
)

# Remover meta_vendas e meta_faturamento do useState metaPessoa
content = re.sub(
    r'const \[metaPessoa, setMetaPessoa\] = useState\(\{ meta_vendas: 0, meta_faturamento: 0 \}\);',
    'const [metaPessoa, setMetaPessoa] = useState({ meta_vendas: 0, meta_faturamento: 0 });',
    content
)

# Remover preenchimento automático das metas
content = re.sub(
    r'// Preencher metas automaticamente se vazias.*?meta_faturamento: meta\.meta_faturamento\s*\}\)\);\s*\}',
    '',
    content, flags=re.DOTALL
)

# Atualizar handleChange
content = re.sub(
    r"'mes', 'ano', 'calls_agendadas', 'calls_realizadas', 'vendas', 'meta_vendas', 'meta_faturamento'",
    "'mes', 'ano', 'calls_agendadas', 'calls_realizadas', 'vendas', 'booking', 'faturamento_bruto', 'faturamento_liquido'",
    content
)

content = re.sub(
    r"\['mes', 'ano', 'calls_agendadas', 'calls_realizadas', 'vendas'\]\.includes\(name\)\s*\? parseInt\(value\) \|\| 0\s*: value",
    "['mes', 'ano', 'calls_agendadas', 'calls_realizadas', 'vendas'].includes(name)\n        ? parseInt(value) || 0\n        : ['faturamento', 'booking', 'faturamento_bruto', 'faturamento_liquido'].includes(name)\n        ? parseFloat(value) || 0\n        : value",
    content
)

with open(closer_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ CloserForm.jsx atualizado")
print("\n🎉 Todos os formulários foram atualizados!")
print("\nNOTA: Você ainda precisa adicionar manualmente os campos de input")
print("booking, faturamento_bruto e faturamento_liquido no JSX do CloserForm")
