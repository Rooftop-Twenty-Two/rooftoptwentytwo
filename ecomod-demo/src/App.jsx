import React from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppProvider } from './state/AppState.jsx'
import { AnnotationProvider } from './components/Annotations.jsx'
import { Layout } from './components/Layout.jsx'
import { Home } from './pages/Home.jsx'
import { Sector } from './pages/Sector.jsx'
import { Catalogue } from './pages/Catalogue.jsx'
import { UnitDetail } from './pages/UnitDetail.jsx'
import { RFQ } from './pages/RFQ.jsx'
import { Confirmation, SpecSummary } from './pages/Confirmation.jsx'
import { Yard } from './pages/Yard.jsx'
import { Repo, RepoDetail } from './pages/Repo.jsx'
import { Admin } from './pages/Admin.jsx'
import { Architecture } from './pages/Architecture.jsx'
import { DemoScript } from './pages/DemoScript.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AnnotationProvider>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sectors/:slug" element={<Sector />} />
              <Route path="/units" element={<Catalogue />} />
              <Route path="/units/:id" element={<UnitDetail />} />
              <Route path="/rfq" element={<RFQ />} />
              <Route path="/rfq/confirmation/:ref" element={<Confirmation />} />
              <Route path="/spec/:ref" element={<SpecSummary />} />
              <Route path="/yard" element={<Yard />} />
              <Route path="/repo" element={<Repo />} />
              <Route path="/repo/:ref" element={<RepoDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/demo-script" element={<DemoScript />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </AnnotationProvider>
      </HashRouter>
    </AppProvider>
  )
}
