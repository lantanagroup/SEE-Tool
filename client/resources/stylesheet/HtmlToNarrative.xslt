<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:cda="urn:hl7-org:v3" xmlns="urn:hl7-org:v3">
	<xsl:output omit-xml-declaration="yes" method="xml" version="1.0" encoding="UTF-8" indent="yes"/>
	
	<xsl:template match="node()|@*">
		<xsl:copy>
			<xsl:apply-templates select="node()|@*"/>
		</xsl:copy>
	</xsl:template>
	
	<xsl:template match="/xhtml:p | /p">
		<paragraph>
			<xsl:apply-templates select="./@*" />
			<xsl:apply-templates />
		</paragraph>
	</xsl:template>
	
	<xsl:template match="xhtml:p | p">
			<xsl:apply-templates/>
			
			<br />
	</xsl:template>

  <xsl:template match="xhtml:caption | caption">
    <caption>
      <xsl:apply-templates/>
    </caption>
  </xsl:template>

  <xsl:template match="xhtml:li | li">
		<item>
			<xsl:apply-templates select="@id|@style"/>
			<xsl:apply-templates />
		</item>
	</xsl:template>
	
	<xsl:template match="xhtml:ol | ol">
		<list listType="ordered">
			<xsl:apply-templates />
		</list>
	</xsl:template>
	
	<xsl:template match="xhtml:ul | ul">
		<list>
			<xsl:apply-templates />
		</list>
	</xsl:template>
	
	<xsl:template match="xhtml:strong | strong">
		<content styleCode="Bold">
			<xsl:apply-templates />
		</content>
	</xsl:template>
	
	<xsl:template match="xhtml:em | em">
		<content styleCode="Italic">
			<xsl:apply-templates />
		</content>
	</xsl:template>
	
	<xsl:template match="xhtml:span | span">
		<content>
			<xsl:apply-templates select="./@*"/>
			<xsl:apply-templates/>
		</content>
	</xsl:template>
	
	<xsl:template match="xhtml:a | a">
		<linkHref>
			<xsl:apply-templates select="./@*"/>
			<xsl:apply-templates/>
		</linkHref>
	</xsl:template>
	
	<xsl:template match="xhtml:br | br">
		<br>
			<xsl:apply-templates select="./@*"/>
			<xsl:apply-templates/>
		</br>
	</xsl:template>
	
	<xsl:template match="xhtml:sub | sub">
		<sub>
			<xsl:apply-templates select="./@*"/>
			<xsl:apply-templates/>
		</sub>
	</xsl:template>
	
	<xsl:template match="xhtml:sup | sup">
		<sup>
			<xsl:apply-templates select="./@*"/>
			<xsl:apply-templates/>
		</sup>
	</xsl:template>
	
	<!-- Tables -->
	<xsl:template match="xhtml:table | table">
		<table>	
			<xsl:apply-templates select="./@*"/>
			<xsl:apply-templates />
		</table>	
	</xsl:template>
	
	<xsl:template match="xhtml:thead | thead">
		<thead>	
			<xsl:apply-templates/>
		</thead>	
	</xsl:template>

	<xsl:template match="xhtml:tfoot | tfoot">
		<tfoot>	
			<xsl:apply-templates/>
		</tfoot>	
	</xsl:template>

	<xsl:template match="xhtml:tbody | tbody">
		<tbody>	
			<xsl:apply-templates/>
		</tbody>	
	</xsl:template>

	<xsl:template match="xhtml:colgroup | colgroup">
		<colgroup>	
			<xsl:apply-templates/>
		</colgroup>	
	</xsl:template>

	<xsl:template match="xhtml:col | col">
		<col>	
			<xsl:apply-templates/>
		</col>	
	</xsl:template>

	<xsl:template match="xhtml:tr | tr">
		<tr>	
			<xsl:apply-templates/>
		</tr>	
	</xsl:template>

	<xsl:template match="xhtml:th | th">
		<th>	
			<xsl:apply-templates/>
		</th>	
	</xsl:template>

	<xsl:template match="xhtml:td | td">
		<td>	
			<xsl:apply-templates/>
		</td>	
	</xsl:template>
	
	<!-- Global matches -->
	<xsl:template match="@id">
		<xsl:attribute name="ID"><xsl:value-of select="."/></xsl:attribute>
	</xsl:template>
	<xsl:template match="@style">
		<xsl:attribute name="styleCode"><xsl:value-of select="."/></xsl:attribute>
	</xsl:template>
	<xsl:template match="@data-mce-style" />
	<xsl:template match="xhtml:h1|xhtml:h2|xhtml:h3|xhtml:h4|xhtml:h5|h1|h2|h3|h4|h5">
        <content styleCode="Bold">
            <xsl:apply-templates />
        </content><br />
	</xsl:template>
</xsl:stylesheet>