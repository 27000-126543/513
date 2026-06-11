with open('src/store/appStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = """      let pushedToManufacturing = state.pushedToManufacturing || [];
      if (existing && existing.level === 'level_2') {
        pushedToManufacturing = [...pushedToManufacturing, existing.taskId];
      }"""

new = """      let pushedToManufacturing = state.pushedToManufacturing || [];
      if (existing && existing.level === 'level_2') {
        if (!pushedToManufacturing.some((p) => p.taskId === existing.taskId)) {
          pushedToManufacturing = [
            ...pushedToManufacturing,
            {
              taskId: existing.taskId,
              pushedBy: state.currentUser.name,
              pushedAt: new Date(),
            },
          ];
        }
      }"""

content = content.replace(old, new)

with open('src/store/appStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('approveApproval 修改成功')
