import EntityPage from '@/components/EntityPage'

type EntityParams = {
  params: {
    entity: string
  }
}

export default function EntityRoute({ params }: EntityParams) {
  return <EntityPage entitySlug={params.entity} />
}
